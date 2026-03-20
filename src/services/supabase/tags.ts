import { supabase } from './client';
import {
  Tag,
  CreateTagRequest,
  ApiError,
} from '@types';
import { API_ERRORS } from '@constants/errors';

export const tagsService = {
  /**
   * Create a new tag
   */
  async createTag(userId: string, request: CreateTagRequest): Promise<Tag> {
    try {
      // Check for duplicate name
      const { data: existing } = await supabase
        .from('tags')
        .select('id')
        .eq('user_id', userId)
        .eq('name', request.name)
        .maybeSingle();

      if (existing) {
        throw API_ERRORS.TAG_NAME_EXISTS;
      }

      const { data, error } = await supabase
        .from('tags')
        .insert({
          user_id: userId,
          name: request.name,
          color: request.color || '#7C9E7F',
        })
        .select()
        .single();

      if (error || !data) {
        throw error || new Error('Failed to create tag');
      }

      return this.mapTagRow(data);
    } catch (error) {
      console.error('Create tag error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Get all tags for user
   */
  async getTags(userId: string) {
    try {
      const { data: tags, error, count } = await supabase
        .from('tags')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;

      // Get entry count for each tag
      const tagsWithCounts = await Promise.all(
        (tags || []).map(async (tag) => {
          const { count: entryCount } = await supabase
            .from('entry_tags')
            .select('*', { count: 'exact' })
            .eq('tag_id', tag.id);

          return {
            ...this.mapTagRow(tag),
            entryCount: entryCount || 0,
          };
        })
      );

      return {
        tags: tagsWithCounts,
        total: count || 0,
      };
    } catch (error) {
      console.error('Get tags error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Get single tag by ID
   */
  async getTagById(tagId: string, userId: string) {
    try {
      const { data: tag, error: tagError } = await supabase
        .from('tags')
        .select()
        .eq('id', tagId)
        .eq('user_id', userId)
        .single();

      if (tagError || !tag) {
        throw tagError || new Error('Tag not found');
      }

      // Get entry count
      const { count: entryCount } = await supabase
        .from('entry_tags')
        .select('*', { count: 'exact' })
        .eq('tag_id', tagId);

      return {
        ...this.mapTagRow(tag),
        entryCount: entryCount || 0,
      };
    } catch (error) {
      console.error('Get tag error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Update tag
   */
  async updateTag(
    tagId: string,
    userId: string,
    updates: { name?: string; color?: string }
  ): Promise<Tag> {
    try {
      // Check for duplicate name if updating name
      if (updates.name) {
        const { data: existing } = await supabase
          .from('tags')
          .select('id')
          .eq('user_id', userId)
          .eq('name', updates.name)
          .neq('id', tagId)
          .maybeSingle();

        if (existing) {
          throw API_ERRORS.TAG_NAME_EXISTS;
        }
      }

      const { data, error } = await supabase
        .from('tags')
        .update({
          name: updates.name,
          color: updates.color,
        })
        .eq('id', tagId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !data) {
        throw error || new Error('Failed to update tag');
      }

      return this.mapTagRow(data);
    } catch (error) {
      console.error('Update tag error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Delete tag and remove all entry associations
   */
  async deleteTag(tagId: string, userId: string): Promise<void> {
    try {
      // Remove all entry_tag links
      await supabase
        .from('entry_tags')
        .delete()
        .eq('tag_id', tagId);

      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Delete tag error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Get tag entries
   */
  async getTagEntries(tagId: string, userId: string, limit: number = 20, offset: number = 0) {
    try {
      // Get entry IDs for this tag
      const { data: entryTagsData, error: joinError } = await supabase
        .from('entry_tags')
        .select('entry_id')
        .eq('tag_id', tagId);

      if (joinError) throw joinError;

      const entryIds = entryTagsData?.map((et) => et.entry_id) || [];

      if (entryIds.length === 0) {
        return {
          entries: [],
          total: 0,
          hasMore: false,
        };
      }

      // Get entries
      const { data: entries, error: entriesError, count } = await supabase
        .from('entries')
        .select('*', { count: 'exact' })
        .in('id', entryIds)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (entriesError) throw entriesError;

      return {
        entries: (entries || []).map(this.mapEntryRow),
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      };
    } catch (error) {
      console.error('Get tag entries error:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Get tags by search query
   */
  async searchTags(userId: string, query: string) {
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      return (tags || []).map(this.mapTagRow);
    } catch (error) {
      console.error('Search tags error:', error);
      throw this.handleError(error);
    }
  },

  // ==================== HELPERS ====================

  private mapTagRow(row: any): Tag {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      color: row.color,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  private mapEntryRow(row: any) {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      mood: row.mood,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  },

  private handleError(error: any): ApiError {
    const errorMessage = (error?.message || 'Unknown error').toLowerCase();

    if (errorMessage.includes('not found')) {
      return API_ERRORS.TAG_NOT_FOUND;
    }

    if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
      return API_ERRORS.TAG_NAME_EXISTS;
    }

    if (error?.status === 401) {
      return API_ERRORS.UNAUTHORIZED;
    }

    if (error?.status === 403) {
      return API_ERRORS.FORBIDDEN;
    }

    return API_ERRORS.UNKNOWN_ERROR;
  },
};
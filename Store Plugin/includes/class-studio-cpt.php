<?php
/**
 * Studio CPT Management Class
 * Handles registration of Custom Post Type 'studio_media' & meta fields
 */

if (!defined('ABSPATH')) {
    exit;
}

class Studio_Media_CPT {

    public static function init() {
        add_action('init', [__CLASS__, 'register_post_type']);
        add_action('init', [__CLASS__, 'register_meta_fields']);
    }

    public static function register_post_type() {
        $labels = [
            'name'                  => 'آثار استودیو',
            'singular_name'         => 'اثر استودیو',
            'menu_name'             => 'استودیو آثار',
            'name_admin_bar'        => 'اثر جدید استودیو',
            'add_new'               => 'افزودن اثر جدید',
            'add_new_item'          => 'افزودن اثر جدید به استودیو',
            'new_item'              => 'اثر جدید',
            'edit_item'             => 'ویرایش اثر',
            'view_item'             => 'مشاهده اثر',
            'all_items'             => 'همه آثار',
            'search_items'          => 'جستجوی آثار',
            'not_found'             => 'اثری یافت نشد.',
            'not_found_in_trash'    => 'اثری در زبانه‌دان یافت نشد.'
        ];

        $args = [
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => ['slug' => 'studio-media'],
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => 20,
            'menu_icon'          => 'dashicons-format-gallery',
            'supports'           => ['title', 'editor', 'thumbnail', 'custom-fields', 'tags'],
            'show_in_rest'       => true,
        ];

        register_post_type('studio_media', $args);
    }

    public static function register_meta_fields() {
        $meta_keys = [
            'price_irr'      => 'number',
            'media_type'     => 'string', // 'image' یا 'video'
            'camera_model'   => 'string',
            'location'       => 'string',
            'resolution'     => 'string',
            'pond5_link'     => 'string',
            'preview_url'    => 'string',
            'original_file'  => 'string',
            'tags_list'      => 'string',
        ];

        foreach ($meta_keys as $key => $type) {
            register_post_meta('studio_media', '_studio_' . $key, [
                'type'         => $type,
                'single'       => true,
                'show_in_rest' => true,
            ]);
        }
    }
}

Studio_Media_CPT::init();

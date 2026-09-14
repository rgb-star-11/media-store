<?php
/**
 * Studio CPT Management Class
 * Handles Custom Post Type 'studio_media', Taxonomies, Admin Columns & Metaboxes
 */

if (!defined('ABSPATH')) {
    exit;
}

class Studio_Media_CPT {

    public static function init() {
        add_action('init', [__CLASS__, 'register_post_type']);
        add_action('init', [__CLASS__, 'register_taxonomy']);
        add_action('init', [__CLASS__, 'register_meta_fields']);

        // ستون‌های پیشخوان وردپرس در لیست آثار
        add_filter('manage_studio_media_posts_columns', [__CLASS__, 'add_admin_columns']);
        add_action('manage_studio_media_posts_custom_column', [__CLASS__, 'render_admin_columns'], 10, 2);

        // متاباکس تنظیمات اثر در صفحه ویرایش
        add_action('add_meta_boxes', [__CLASS__, 'add_metaboxes']);
        add_action('save_post_studio_media', [__CLASS__, 'save_metabox_data']);
    }

    public static function register_post_type() {
        $labels = [
            'name'                  => 'آثار استودیو',
            'singular_name'         => 'اثر استودیو',
            'menu_name'             => 'استودیو آثار',
            'name_admin_bar'        => 'اثر استودیو',
            'add_new'               => 'افزودن اثر جدید',
            'add_new_item'          => 'افزودن اثر جدید به استودیو',
            'new_item'              => 'اثر جدید',
            'edit_item'             => 'ویرایش اثر',
            'view_item'             => 'مشاهده اثر',
            'all_items'             => 'تمام آثار استودیو',
            'search_items'          => 'جستجوی آثار',
            'not_found'             => 'اثری یافت نشد.',
            'not_found_in_trash'    => 'اثری در سطل زباله یافت نشد.'
        ];

        $args = [
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => false, // در منوی اختصاصی Studio_Admin قرار می‌گیرد
            'query_var'          => true,
            'rewrite'            => ['slug' => 'studio-media'],
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'supports'           => ['title', 'editor', 'thumbnail'],
            'show_in_rest'       => true,
        ];

        register_post_type('studio_media', $args);
    }

    public static function register_taxonomy() {
        register_taxonomy('studio_category', 'studio_media', [
            'labels' => [
                'name'          => 'دسته‌بندی آثار',
                'singular_name' => 'دسته‌بندی اثر',
                'search_items'  => 'جستجوی دسته‌ها',
                'all_items'     => 'همه دسته‌ها',
                'edit_item'     => 'ویرایش دسته',
                'update_item'   => 'به‌روزرسانی دسته',
                'add_new_item'  => 'افزودن دسته جدید',
                'menu_name'     => 'دسته‌بندی‌ها',
            ],
            'hierarchical'      => true,
            'show_ui'           => true,
            'show_admin_column' => true,
            'show_in_rest'      => true,
            'rewrite'           => ['slug' => 'studio-cat'],
        ]);
    }

    public static function register_meta_fields() {
        $meta_keys = [
            'price_irr'      => 'number',
            'media_type'     => 'string',
            'camera_model'   => 'string',
            'location'       => 'string',
            'resolution'     => 'string',
            'pond5_link'     => 'string',
            'preview_url'    => 'string',
            'tags'           => 'string',
        ];

        foreach ($meta_keys as $key => $type) {
            register_post_meta('studio_media', '_studio_' . $key, [
                'type'         => $type,
                'single'       => true,
                'show_in_rest' => true,
            ]);
        }
    }

    public static function add_admin_columns($columns) {
        $new_columns = [];
        $new_columns['cb'] = $columns['cb'];
        $new_columns['studio_thumb'] = 'پیش‌نمایش';
        $new_columns['title'] = 'عنوان اثر';
        $new_columns['studio_type'] = 'نوع مدیا';
        $new_columns['studio_price'] = 'قیمت (ریال)';
        $new_columns['studio_camera'] = 'دوربین و لوکیشن';
        $new_columns['date'] = $columns['date'];
        return $new_columns;
    }

    public static function render_admin_columns($column, $post_id) {
        switch ($column) {
            case 'studio_thumb':
                $thumb_url = get_the_post_thumbnail_url($post_id, 'thumbnail');
                if (!$thumb_url) {
                    $thumb_url = get_post_meta($post_id, '_studio_preview_url', true);
                }
                if ($thumb_url) {
                    echo '<img src="' . esc_url($thumb_url) . '" style="width:50px;height:50px;object-fit:cover;border-radius:6px;" />';
                } else {
                    echo '<span style="color:#999;">بدون تصویر</span>';
                }
                break;
            case 'studio_type':
                $type = get_post_meta($post_id, '_studio_media_type', true) ?: 'image';
                echo $type === 'video' ? '<span style="background:#e3f2fd;color:#1976d2;padding:2px 8px;border-radius:4px;font-size:12px;">ویدیو</span>' 
                                       : '<span style="background:#f3e5f5;color:#7b1fa2;padding:2px 8px;border-radius:4px;font-size:12px;">تصویر</span>';
                break;
            case 'studio_price':
                $price = get_post_meta($post_id, '_studio_price_irr', true);
                echo $price ? number_format(intval($price)) . ' ریال' : '<span style="color:#2e7d32;">رایگان</span>';
                break;
            case 'studio_camera':
                $camera = get_post_meta($post_id, '_studio_camera_model', true);
                $loc = get_post_meta($post_id, '_studio_location', true);
                echo esc_html(implode(' | ', array_filter([$camera, $loc]))) ?: '-';
                break;
        }
    }

    public static function add_metaboxes() {
        add_meta_box(
            'studio_media_details',
            'مشخصات و متادیتای اختصاصی استودیو',
            [__CLASS__, 'render_metabox'],
            'studio_media',
            'normal',
            'high'
        );
    }

    public static function render_metabox($post) {
        wp_nonce_field('studio_save_meta', 'studio_meta_nonce');

        $media_type   = get_post_meta($post->ID, '_studio_media_type', true) ?: 'image';
        $price_irr    = get_post_meta($post->ID, '_studio_price_irr', true);
        $camera_model = get_post_meta($post->ID, '_studio_camera_model', true);
        $location     = get_post_meta($post->ID, '_studio_location', true);
        $resolution   = get_post_meta($post->ID, '_studio_resolution', true) ?: '1920x1080';
        $pond5_link   = get_post_meta($post->ID, '_studio_pond5_link', true);
        $preview_url  = get_post_meta($post->ID, '_studio_preview_url', true);
        $tags         = get_post_meta($post->ID, '_studio_tags', true);
        ?>
        <table class="form-table" style="direction: rtl;">
            <tr>
                <th><label for="studio_media_type">نوع فایل رسانه:</label></th>
                <td>
                    <select name="studio_media_type" id="studio_media_type" class="regular-text">
                        <option value="image" <?php selected($media_type, 'image'); ?>>تصویر (Photo)</option>
                        <option value="video" <?php selected($media_type, 'video'); ?>>ویدیو (Video Footage)</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th><label for="studio_price_irr">قیمت (ریال):</label></th>
                <td>
                    <input type="number" name="studio_price_irr" id="studio_price_irr" value="<?php echo esc_attr($price_irr); ?>" class="regular-text" placeholder="مثال: 500000" />
                </td>
            </tr>
            <tr>
                <th><label for="studio_camera_model">مدل دوربین یا تجهیزات:</label></th>
                <td>
                    <input type="text" name="studio_camera_model" id="studio_camera_model" value="<?php echo esc_attr($camera_model); ?>" class="regular-text" placeholder="مثال: Sony A7 IV / Canon R5" />
                </td>
            </tr>
            <tr>
                <th><label for="studio_location">محل عکاسی / فیلمبرداری:</label></th>
                <td>
                    <input type="text" name="studio_location" id="studio_location" value="<?php echo esc_attr($location); ?>" class="regular-text" placeholder="مثال: جزیره هرمز، ایران" />
                </td>
            </tr>
            <tr>
                <th><label for="studio_resolution">رزولوشن و کیفیت:</label></th>
                <td>
                    <input type="text" name="studio_resolution" id="studio_resolution" value="<?php echo esc_attr($resolution); ?>" class="regular-text" placeholder="4K UHD (3840x2160)" />
                </td>
            </tr>
            <tr>
                <th><label for="studio_pond5_link">لینک خرید بین‌المللی (Pond5):</label></th>
                <td>
                    <input type="url" name="studio_pond5_link" id="studio_pond5_link" value="<?php echo esc_attr($pond5_link); ?>" class="regular-text" dir="ltr" placeholder="https://www.pond5.com/..." />
                </td>
            </tr>
            <tr>
                <th><label for="studio_preview_url">آدرس فایل پیش‌نمایش (Preview URL):</label></th>
                <td>
                    <input type="text" name="studio_preview_url" id="studio_preview_url" value="<?php echo esc_attr($preview_url); ?>" class="regular-text" dir="ltr" />
                </td>
            </tr>
            <tr>
                <th><label for="studio_tags">برچسب‌ها (با کاما یا # جدا کنید):</label></th>
                <td>
                    <input type="text" name="studio_tags" id="studio_tags" value="<?php echo esc_attr($tags); ?>" class="regular-text" placeholder="طبیعت, دریا, غروب" />
                </td>
            </tr>
        </table>
        <?php
    }

    public static function save_metabox_data($post_id) {
        if (!isset($_POST['studio_meta_nonce']) || !wp_verify_nonce($_POST['studio_meta_nonce'], 'studio_save_meta')) {
            return;
        }
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        if (isset($_POST['studio_media_type'])) update_post_meta($post_id, '_studio_media_type', sanitize_text_field($_POST['studio_media_type']));
        if (isset($_POST['studio_price_irr'])) update_post_meta($post_id, '_studio_price_irr', intval($_POST['studio_price_irr']));
        if (isset($_POST['studio_camera_model'])) update_post_meta($post_id, '_studio_camera_model', sanitize_text_field($_POST['studio_camera_model']));
        if (isset($_POST['studio_location'])) update_post_meta($post_id, '_studio_location', sanitize_text_field($_POST['studio_location']));
        if (isset($_POST['studio_resolution'])) update_post_meta($post_id, '_studio_resolution', sanitize_text_field($_POST['studio_resolution']));
        if (isset($_POST['studio_pond5_link'])) update_post_meta($post_id, '_studio_pond5_link', esc_url_raw($_POST['studio_pond5_link']));
        if (isset($_POST['studio_preview_url'])) update_post_meta($post_id, '_studio_preview_url', esc_url_raw($_POST['studio_preview_url']));
        if (isset($_POST['studio_tags'])) update_post_meta($post_id, '_studio_tags', sanitize_text_field($_POST['studio_tags']));
    }
}

Studio_Media_CPT::init();

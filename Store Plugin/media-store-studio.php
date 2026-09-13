<?php
/**
 * Plugin Name: Studio Media Store
 * Plugin URI: https://studioportfolio.com
 * Description: پلاگین اختصاصی گالری، فروش و نمایش آثار عکاسی و ویدیو فوتیج با رابط کاربری حرفه‌ای React 19
 * Version: 1.0.0
 * Author: Mansour Mayahi
 * Text Domain: studio-media-store
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('STUDIO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('STUDIO_PLUGIN_URL', plugin_dir_url(__FILE__));

// فراخوانی کلاس‌های هسته پلاگین
require_once STUDIO_PLUGIN_DIR . 'includes/class-studio-cpt.php';
require_once STUDIO_PLUGIN_DIR . 'includes/class-studio-rest-api.php';

class Studio_Media_Store_Plugin {

    public static function init() {
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_assets']);
        add_shortcode('studio_media_store', [__CLASS__, 'render_shortcode']);
        add_action('admin_menu', [__CLASS__, 'add_admin_menu']);
    }

    public static function enqueue_assets() {
        $assets_dir = STUDIO_PLUGIN_DIR . 'assets/';
        $assets_url = STUDIO_PLUGIN_URL . 'assets/';

        if (!is_dir($assets_dir)) return;

        // شناسایی فایل‌های تعاملی JS و CSS ساخته‌شده با React
        $js_files  = glob($assets_dir . 'index-*.js');
        $css_files = glob($assets_dir . 'index-*.css');

        if (!empty($css_files)) {
            $css_file = basename($css_files[0]);
            wp_enqueue_style('studio-media-css', $assets_url . $css_file, [], '1.0.0');
        }

        if (!empty($js_files)) {
            $js_file = basename($js_files[0]);
            wp_enqueue_script('studio-media-js', $assets_url . $js_file, [], '1.0.0', true);
        }
    }

    public static function render_shortcode($atts = []) {
        self::enqueue_assets();
        return '<div id="root" class="studio-media-store-container"></div>';
    }

    public static function add_admin_menu() {
        add_menu_page(
            'تنظیمات استودیو',
            'استودیو آثار',
            'manage_options',
            'studio-media-store',
            [__CLASS__, 'render_admin_page'],
            'dashicons-format-gallery',
            25
        );
    }

    public static function render_admin_page() {
        ?>
        <div class="wrap" dir="rtl">
            <h1>تنظیمات استودیو آثار</h1>
            <p>پلاگین با موفقیت فعال شد. شما می‌توانید شورت‌کد زیر را در هر برگه‌ای قرار دهید:</p>
            <div style="background: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #ccd0d4; max-width: 400px; margin: 16px 0;">
                <code style="font-size: 16px; color: #d63638;">[studio_media_store]</code>
            </div>
            <p>تمام آثار و تنظیمات سایت به صورت خودکار از طریق API همگام‌سازی می‌شوند.</p>
        </div>
        <?php
    }
}

Studio_Media_Store_Plugin::init();

<?php
/**
 * Plugin Name: Studio Media Store
 * Plugin URI: https://studioportfolio.com
 * Description: افزونه اختصاصی گالری، فروش و نمایش آثار عکاسی و ویدیو فوتیج با رابط کاربری حرفه‌ای React 19 و بک‌اند بومی وردپرس
 * Version: 1.1.0
 * Author: Mansour Mayahi
 * Text Domain: studio-media-store
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('STUDIO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('STUDIO_PLUGIN_URL', plugin_dir_url(__FILE__));

// ۱. فراخوانی هسته و لایه‌های بک‌اند افزونه
require_once STUDIO_PLUGIN_DIR . 'includes/class-studio-installer.php';
require_once STUDIO_PLUGIN_DIR . 'includes/class-studio-cpt.php';
require_once STUDIO_PLUGIN_DIR . 'includes/class-studio-admin.php';
require_once STUDIO_PLUGIN_DIR . 'includes/class-studio-rest-api.php';

// ۲. هوک فعال‌سازی افزونه جهت ساخت جداول دیتابیس با dbDelta
register_activation_hook(__FILE__, ['Studio_Installer', 'install']);

class Studio_Media_Store_Plugin {

    public static function init() {
        // اطمینان از وجود جداول دیتابیس در زمان اجرا (حتی در صورت عدم غیرفعال‌سازی مجدد)
        add_action('plugins_loaded', ['Studio_Installer', 'check_tables']);

        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue_assets']);
        add_filter('script_loader_tag', [__CLASS__, 'add_module_to_script'], 10, 3);
        add_shortcode('studio_media_store', [__CLASS__, 'render_shortcode']);
    }

    public static function enqueue_assets() {
        $assets_dir = STUDIO_PLUGIN_DIR . 'assets/';
        $assets_url = STUDIO_PLUGIN_URL . 'assets/';

        if (!is_dir($assets_dir)) return;

        // فایل‌های استایل و اسکریپت بیلد شده React
        $js_files  = glob($assets_dir . 'index-*.js');
        $css_files = glob($assets_dir . 'index-*.css');

        if (!empty($css_files)) {
            $css_file = basename($css_files[0]);
            wp_enqueue_style('studio-media-css', $assets_url . $css_file, [], '1.1.0');
        }

        if (!empty($js_files)) {
            $js_file = basename($js_files[0]);
            wp_enqueue_script('studio-media-js', $assets_url . $js_file, [], '1.1.0', true);

            // ارسال نانس امنیتی وردپرس به کلاینت React
            wp_localize_script('studio-media-js', 'wpApiSettings', [
                'root'  => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest')
            ]);
        }
    }

    public static function add_module_to_script($tag, $handle, $src) {
        if ('studio-media-js' === $handle) {
            return '<script type="module" src="' . esc_url($src) . '" id="studio-media-js-js"></script>';
        }
        return $tag;
    }

    public static function render_shortcode($atts = []) {
        self::enqueue_assets();
        return '<div id="root" class="studio-media-store-container"></div>';
    }
}

Studio_Media_Store_Plugin::init();

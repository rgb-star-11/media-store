<?php
/**
 * Studio Database Installer Class
 * Creates custom database tables for messages, orders, OTPs, and authentication tokens using WordPress dbDelta
 */

if (!defined('ABSPATH')) {
    exit;
}

class Studio_Installer {

    public static function install() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        // 1. جدول پیام‌های فرم تماس (Messages)
        $table_messages = $wpdb->prefix . 'studio_messages';
        $sql_messages = "CREATE TABLE $table_messages (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            mobile varchar(50) DEFAULT NULL,
            message text NOT NULL,
            is_read tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY is_read (is_read),
            KEY created_at (created_at)
        ) $charset_collate;";
        dbDelta($sql_messages);

        // 2. جدول سفارشات و تراکنش‌ها (Orders / Transactions)
        $table_orders = $wpdb->prefix . 'studio_orders';
        $sql_orders = "CREATE TABLE $table_orders (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            media_id bigint(20) NOT NULL,
            user_id bigint(20) DEFAULT NULL,
            amount bigint(20) NOT NULL DEFAULT 0,
            currency varchar(10) DEFAULT 'IRR',
            status varchar(50) DEFAULT 'pending',
            customer_email varchar(255) DEFAULT '',
            customer_name varchar(255) DEFAULT '',
            customer_mobile varchar(50) DEFAULT '',
            gateway varchar(100) DEFAULT 'manual',
            transaction_id varchar(255) DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY status (status),
            KEY media_id (media_id),
            KEY user_id (user_id)
        ) $charset_collate;";
        dbDelta($sql_orders);

        // 3. جدول کدهای پیامکی یکبار مصرف (OTPs)
        $table_otps = $wpdb->prefix . 'studio_otps';
        $sql_otps = "CREATE TABLE $table_otps (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            mobile varchar(50) NOT NULL,
            otp_code varchar(10) NOT NULL,
            expires_at datetime NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY mobile (mobile)
        ) $charset_collate;";
        dbDelta($sql_otps);

        // 4. جدول توکن‌های نشست احراز هویت استودیو (Studio Auth Tokens)
        $table_tokens = $wpdb->prefix . 'studio_tokens';
        $sql_tokens = "CREATE TABLE $table_tokens (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            token varchar(64) NOT NULL,
            role varchar(50) DEFAULT 'user',
            expires_at datetime NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY token_idx (token),
            KEY user_id (user_id)
        ) $charset_collate;";
        dbDelta($sql_tokens);

        // ذخیره نسخه ساختار دیتابیس
        update_option('studio_db_version', '1.0.0');
    }

    /**
     * اطمینان از وجود جداول در زمان لود (حتی بدون فعال‌سازی مجدد افزونه)
     */
    public static function check_tables() {
        if (get_option('studio_db_version') !== '1.0.0') {
            self::install();
        }
    }
}

<?php
/**
 * Studio Admin Management Class
 * Handles WP-Admin Menus, Screens for Messages, Orders, Users, and Settings
 */

if (!defined('ABSPATH')) {
    exit;
}

class Studio_Admin {

    public static function init() {
        add_action('admin_menu', [__CLASS__, 'register_admin_menus']);
        add_action('admin_init', [__CLASS__, 'handle_admin_actions']);
    }

    public static function register_admin_menus() {
        global $wpdb;

        // محاسبه تعداد پیام‌های خوانده‌نشده جهت نمایش بج عددی در منو
        $table_messages = $wpdb->prefix . 'studio_messages';
        $unread_count = 0;
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_messages'") === $table_messages) {
            $unread_count = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_messages WHERE is_read = 0");
        }
        $msg_badge = $unread_count > 0 ? " <span class='update-plugins count-$unread_count'><span class='plugin-count'>$unread_count</span></span>" : '';

        // منوی اصلی افزونه
        add_menu_page(
            'استودیو آثار',
            'استودیو آثار' . $msg_badge,
            'manage_options',
            'studio-dashboard',
            [__CLASS__, 'render_dashboard_page'],
            'dashicons-format-gallery',
            25
        );

        // زیرمنوها
        add_submenu_page(
            'studio-dashboard',
            'پیشخوان استودیو',
            'پیشخوان',
            'manage_options',
            'studio-dashboard',
            [__CLASS__, 'render_dashboard_page']
        );

        add_submenu_page(
            'studio-dashboard',
            'همه آثار',
            'تمام آثار استودیو',
            'manage_options',
            'edit.php?post_type=studio_media'
        );

        add_submenu_page(
            'studio-dashboard',
            'افزودن اثر جدید',
            'افزودن اثر جدید',
            'manage_options',
            'post-new.php?post_type=studio_media'
        );

        add_submenu_page(
            'studio-dashboard',
            'دسته‌بندی آثار',
            'دسته‌بندی‌ها',
            'manage_options',
            'edit-tags.php?taxonomy=studio_category&post_type=studio_media'
        );

        add_submenu_page(
            'studio-dashboard',
            'پیام‌های دریافتی',
            'پیام‌ها' . $msg_badge,
            'manage_options',
            'studio-messages',
            [__CLASS__, 'render_messages_page']
        );

        add_submenu_page(
            'studio-dashboard',
            'تراکنش‌ها و سفارشات',
            'تراکنش‌ها و سفارشات',
            'manage_options',
            'studio-orders',
            [__CLASS__, 'render_orders_page']
        );

        add_submenu_page(
            'studio-dashboard',
            'اعضا و کاربران',
            'کاربران استودیو',
            'manage_options',
            'studio-users',
            [__CLASS__, 'render_users_page']
        );

        add_submenu_page(
            'studio-dashboard',
            'تنظیمات استودیو',
            'تنظیمات عمومی',
            'manage_options',
            'studio-settings',
            [__CLASS__, 'render_settings_page']
        );
    }

    public static function handle_admin_actions() {
        global $wpdb;
        if (!current_user_can('manage_options')) return;

        // اکشن‌های مربوط به پیام‌ها
        if (isset($_GET['page']) && $_GET['page'] === 'studio-messages' && isset($_GET['action']) && isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $table = $wpdb->prefix . 'studio_messages';
            check_admin_referer('studio_msg_action_' . $id);

            if ($_GET['action'] === 'delete') {
                $wpdb->delete($table, ['id' => $id]);
                wp_redirect(admin_url('admin.php?page=studio-messages&deleted=1'));
                exit;
            } elseif ($_GET['action'] === 'toggle_read') {
                $current = (int)$wpdb->get_var($wpdb->prepare("SELECT is_read FROM $table WHERE id = %d", $id));
                $wpdb->update($table, ['is_read' => $current ? 0 : 1], ['id' => $id]);
                wp_redirect(admin_url('admin.php?page=studio-messages&updated=1'));
                exit;
            }
        }

        // اکشن ذخیره تنظیمات عمومی استودیو
        if (isset($_POST['studio_save_settings']) && check_admin_referer('studio_settings_nonce')) {
            update_option('studio_hero_title', sanitize_text_field($_POST['heroTitle'] ?? ''));
            update_option('studio_hero_title_accent', sanitize_text_field($_POST['heroTitleAccent'] ?? ''));
            update_option('studio_hero_subtitle', sanitize_text_field($_POST['heroSubtitle'] ?? ''));
            update_option('studio_hero_badge', sanitize_text_field($_POST['heroBadgeText'] ?? ''));
            update_option('studio_about_title', sanitize_text_field($_POST['aboutTitle'] ?? ''));
            update_option('studio_about_text', sanitize_textarea_field($_POST['aboutText'] ?? ''));
            update_option('studio_bg_effect', sanitize_text_field($_POST['backgroundEffect'] ?? 'tubes-all'));
            update_option('studio_instagram', sanitize_text_field($_POST['instagram'] ?? ''));
            update_option('studio_youtube', sanitize_text_field($_POST['youtube'] ?? ''));
            update_option('studio_pond5', sanitize_text_field($_POST['pond5'] ?? ''));

            wp_redirect(admin_url('admin.php?page=studio-settings&saved=1'));
            exit;
        }
    }

    // 1. پیشخوان کلی استودیو
    public static function render_dashboard_page() {
        global $wpdb;
        $total_media = wp_count_posts('studio_media')->publish ?? 0;
        $table_messages = $wpdb->prefix . 'studio_messages';
        $total_messages = 0;
        $unread_messages = 0;
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_messages'") === $table_messages) {
            $total_messages = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_messages");
            $unread_messages = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_messages WHERE is_read = 0");
        }
        $table_orders = $wpdb->prefix . 'studio_orders';
        $total_orders = 0;
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_orders'") === $table_orders) {
            $total_orders = (int)$wpdb->get_var("SELECT COUNT(*) FROM $table_orders");
        }
        ?>
        <div class="wrap" dir="rtl" style="font-family: inherit;">
            <h1 style="display:flex;align-items:center;gap:10px;">
                <span class="dashicons dashicons-format-gallery" style="font-size:32px;width:32px;height:32px;"></span>
                پیشخوان و مدیریت اختصاصی استودیو آثار
            </h1>
            <p>خوش آمدید! در این بخش می‌توانید تمام بخش‌های پایگاه داده و تنظیمات فروشگاه استودیو را به طور کامل و یکپارچه در وردپرس کنترل کنید.</p>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:20px;margin:25px 0;">
                <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,0.03);">
                    <div style="color:#64748b;font-size:13px;margin-bottom:6px;">تعداد کل آثار منتشر شده</div>
                    <div style="font-size:30px;font-weight:900;color:#0f172a;"><?php echo number_format($total_media); ?></div>
                    <div style="margin-top:10px;"><a href="<?php echo admin_url('edit.php?post_type=studio_media'); ?>" class="button button-small">مشاهده آثار &larr;</a></div>
                </div>

                <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,0.03);">
                    <div style="color:#64748b;font-size:13px;margin-bottom:6px;">پیام‌های فرم تماس</div>
                    <div style="font-size:30px;font-weight:900;color:#0f172a;"><?php echo number_format($total_messages); ?> <span style="font-size:14px;color:#d97706;">(<?php echo $unread_messages; ?> جدید)</span></div>
                    <div style="margin-top:10px;"><a href="<?php echo admin_url('admin.php?page=studio-messages'); ?>" class="button button-small">صندوق پیام‌ها &larr;</a></div>
                </div>

                <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,0.03);">
                    <div style="color:#64748b;font-size:13px;margin-bottom:6px;">سفارش‌ها و تراکنش‌ها</div>
                    <div style="font-size:30px;font-weight:900;color:#0f172a;"><?php echo number_format($total_orders); ?></div>
                    <div style="margin-top:10px;"><a href="<?php echo admin_url('admin.php?page=studio-orders'); ?>" class="button button-small">لیست سفارشات &larr;</a></div>
                </div>

                <div style="background:#fff;padding:20px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,0.03);">
                    <div style="color:#64748b;font-size:13px;margin-bottom:6px;">شورت‌کد نمایش در صفحات</div>
                    <div style="font-size:16px;font-family:monospace;direction:ltr;background:#f8fafc;padding:6px 10px;border-radius:6px;border:1px solid #cbd5e1;margin-bottom:8px;">[studio_media_store]</div>
                    <div style="font-size:12px;color:#64748b;">این شورت‌کد را در هر برگه دلخواه قرار دهید.</div>
                </div>
            </div>
        </div>
        <?php
    }

    // 2. مدیریت پیام‌های فرم تماس
    public static function render_messages_page() {
        global $wpdb;
        $table = $wpdb->prefix . 'studio_messages';
        $messages = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC LIMIT 100");
        ?>
        <div class="wrap" dir="rtl">
            <h1>پیام‌های دریافتی فرم تماس استودیو</h1>
            <?php if (isset($_GET['deleted'])): ?>
                <div class="notice notice-success is-dismissible"><p>پیام با موفقیت حذف شد.</p></div>
            <?php endif; ?>
            <?php if (isset($_GET['updated'])): ?>
                <div class="notice notice-success is-dismissible"><p>وضعیت پیام به‌روزرسانی شد.</p></div>
            <?php endif; ?>

            <table class="wp-list-table widefat fixed striped table-view-list" style="margin-top:15px;">
                <thead>
                    <tr>
                        <th style="width:50px;">شناسه</th>
                        <th style="width:140px;">نام فرستنده</th>
                        <th style="width:180px;">ایمیل</th>
                        <th style="width:120px;">شماره تماس</th>
                        <th>متن پیام</th>
                        <th style="width:90px;">وضعیت</th>
                        <th style="width:140px;">تاریخ ارسال</th>
                        <th style="width:120px;">عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($messages)): ?>
                        <tr><td colspan="8" style="text-align:center;padding:20px;">هیچ پیامی دریافت نشده است.</td></tr>
                    <?php else: foreach ($messages as $msg): ?>
                        <tr style="<?php echo !$msg->is_read ? 'background:#fffbeb;font-weight:bold;' : ''; ?>">
                            <td>#<?php echo esc_html($msg->id); ?></td>
                            <td><?php echo esc_html($msg->name); ?></td>
                            <td><a href="mailto:<?php echo esc_attr($msg->email); ?>"><?php echo esc_html($msg->email); ?></a></td>
                            <td><?php echo esc_html($msg->mobile ?: '-'); ?></td>
                            <td><div style="max-height:80px;overflow-y:auto;white-space:pre-wrap;"><?php echo esc_html($msg->message); ?></div></td>
                            <td>
                                <?php if ($msg->is_read): ?>
                                    <span style="color:#16a34a;background:#dcfce7;padding:2px 8px;border-radius:4px;font-size:11px;">خوانده شده</span>
                                <?php else: ?>
                                    <span style="color:#d97706;background:#fef3c7;padding:2px 8px;border-radius:4px;font-size:11px;">جدید</span>
                                <?php endif; ?>
                            </td>
                            <td><?php echo esc_html(date_i18n('Y/m/d H:i', strtotime($msg->created_at))); ?></td>
                            <td>
                                <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=studio-messages&action=toggle_read&id=' . $msg->id), 'studio_msg_action_' . $msg->id); ?>" class="button button-small">
                                    <?php echo $msg->is_read ? 'علامت نخوانده' : 'خوانده شد'; ?>
                                </a>
                                <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=studio-messages&action=delete&id=' . $msg->id), 'studio_msg_action_' . $msg->id); ?>" onclick="return confirm('آیا از حذف این پیام اطمینان دارید؟');" class="button button-small button-link-delete">حذف</a>
                            </td>
                        </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    // 3. مدیریت سفارشات و تراکنش‌ها
    public static function render_orders_page() {
        global $wpdb;
        $table = $wpdb->prefix . 'studio_orders';
        $orders = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC LIMIT 100");
        ?>
        <div class="wrap" dir="rtl">
            <h1>سفارشات و تراکنش‌های استودیو</h1>
            <table class="wp-list-table widefat fixed striped table-view-list" style="margin-top:15px;">
                <thead>
                    <tr>
                        <th style="width:60px;">سفارش</th>
                        <th>اثر خریداری شده</th>
                        <th>مبلغ (ریال)</th>
                        <th>نام مشتری</th>
                        <th>ایمیل / موبایل</th>
                        <th>درگاه</th>
                        <th>وضعیت</th>
                        <th>تاریخ</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($orders)): ?>
                        <tr><td colspan="8" style="text-align:center;padding:20px;">هیچ سفارشی ثبت نشده است.</td></tr>
                    <?php else: foreach ($orders as $order): 
                        $media_title = get_the_title($order->media_id) ?: ('شناسه #' . $order->media_id);
                    ?>
                        <tr>
                            <td>#<?php echo esc_html($order->id); ?></td>
                            <td><strong><a href="<?php echo get_edit_post_link($order->media_id); ?>"><?php echo esc_html($media_title); ?></a></strong></td>
                            <td><?php echo number_format($order->amount) . ' ' . esc_html($order->currency); ?></td>
                            <td><?php echo esc_html($order->customer_name ?: 'مهمان'); ?></td>
                            <td><?php echo esc_html($order->customer_email ?: $order->customer_mobile); ?></td>
                            <td><?php echo esc_html($order->gateway); ?></td>
                            <td>
                                <?php if ($order->status === 'completed'): ?>
                                    <span style="color:#16a34a;background:#dcfce7;padding:2px 8px;border-radius:4px;font-size:11px;">موفق</span>
                                <?php elseif ($order->status === 'pending'): ?>
                                    <span style="color:#ca8a04;background:#fef9c3;padding:2px 8px;border-radius:4px;font-size:11px;">در انتظار</span>
                                <?php else: ?>
                                    <span style="color:#dc2626;background:#fee2e2;padding:2px 8px;border-radius:4px;font-size:11px;">ناموفق</span>
                                <?php endif; ?>
                            </td>
                            <td><?php echo esc_html(date_i18n('Y/m/d H:i', strtotime($order->created_at))); ?></td>
                        </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    // 4. مدیریت کاربران و اعضا
    public static function render_users_page() {
        $users = get_users(['number' => 100, 'orderby' => 'registered', 'order' => 'DESC']);
        ?>
        <div class="wrap" dir="rtl">
            <h1>کاربران و اعضای استودیو</h1>
            <p>تمامی کاربران عضو در سایت وردپرس شما با مشخصات و شماره همراه ثبت‌شده:</p>
            <table class="wp-list-table widefat fixed striped table-view-list" style="margin-top:15px;">
                <thead>
                    <tr>
                        <th style="width:60px;">شناسه</th>
                        <th>نام کاربر</th>
                        <th>ایمیل</th>
                        <th>شماره همراه</th>
                        <th>نقش کاربری</th>
                        <th>تاریخ عضویت</th>
                        <th>عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $user): 
                        $mobile = get_user_meta($user->ID, 'mobile', true);
                        $role = in_array('administrator', $user->roles) ? 'مدیر کل' : 'کاربر عادی';
                    ?>
                        <tr>
                            <td>#<?php echo esc_html($user->ID); ?></td>
                            <td><strong><?php echo esc_html($user->display_name); ?></strong></td>
                            <td><?php echo esc_html($user->user_email); ?></td>
                            <td><?php echo esc_html($mobile ?: '-'); ?></td>
                            <td>
                                <span style="<?php echo in_array('administrator', $user->roles) ? 'background:#fef3c7;color:#b45309;' : 'background:#e0f2fe;color:#0369a1;'; ?>padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">
                                    <?php echo esc_html($role); ?>
                                </span>
                            </td>
                            <td><?php echo esc_html(date_i18n('Y/m/d', strtotime($user->user_registered))); ?></td>
                            <td>
                                <a href="<?php echo get_edit_user_link($user->ID); ?>" class="button button-small">ویرایش در وردپرس</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    // 5. صفحه تنظیمات عمومی استودیو
    public static function render_settings_page() {
        $hero_title       = get_option('studio_hero_title', 'گالری عکس‌های اختصاصی');
        $hero_accent      = get_option('studio_hero_title_accent', 'ویدیو فوتیج‌های اختصاصی');
        $hero_subtitle    = get_option('studio_hero_subtitle', 'مجموعه‌ای از تصاویر و ویدیوهای باکیفیت برای استفاده تجاری و شخصی');
        $hero_badge       = get_option('studio_hero_badge', 'نمونه‌کارها');
        $about_title      = get_option('studio_about_title', 'درباره من');
        $about_text       = get_option('studio_about_text', 'خوش آمدید به استودیو اختصاصی عکاسی و تصویربرداری.');
        $bg_effect        = get_option('studio_bg_effect', 'tubes-all');
        $instagram        = get_option('studio_instagram', '');
        $youtube          = get_option('studio_youtube', '');
        $pond5            = get_option('studio_pond5', '');
        ?>
        <div class="wrap" dir="rtl">
            <h1>تنظیمات استودیو آثار</h1>
            <?php if (isset($_GET['saved'])): ?>
                <div class="notice notice-success is-dismissible"><p>تنظیمات با موفقیت در دیتابیس وردپرس ذخیره شد.</p></div>
            <?php endif; ?>

            <form method="post" action="" style="max-width:800px;background:#fff;padding:20px;border-radius:8px;border:1px solid #ccd0d4;margin-top:15px;">
                <?php wp_nonce_field('studio_settings_nonce'); ?>

                <h2>بخش هیرو (Hero Section)</h2>
                <table class="form-table">
                    <tr>
                        <th><label for="heroBadgeText">نشان بالای تیتر:</label></th>
                        <td><input type="text" name="heroBadgeText" id="heroBadgeText" value="<?php echo esc_attr($hero_badge); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="heroTitle">تیتر اصلی هیرو:</label></th>
                        <td><input type="text" name="heroTitle" id="heroTitle" value="<?php echo esc_attr($hero_title); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="heroTitleAccent">تیتر بخش دوم (طلایی):</label></th>
                        <td><input type="text" name="heroTitleAccent" id="heroTitleAccent" value="<?php echo esc_attr($hero_accent); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="heroSubtitle">توضیحات زیر تیتر هیرو:</label></th>
                        <td><textarea name="heroSubtitle" id="heroSubtitle" rows="3" class="large-text"><?php echo esc_textarea($hero_subtitle); ?></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="backgroundEffect">افکت پس‌زمینه:</label></th>
                        <td>
                            <select name="backgroundEffect" id="backgroundEffect">
                                <option value="tubes-all" <?php selected($bg_effect, 'tubes-all'); ?>>تیوب‌های سه‌بعدی نوری (Tubes 3D)</option>
                                <option value="dark" <?php selected($bg_effect, 'dark'); ?>>تاریک مینیمال (Dark Minimal)</option>
                            </select>
                        </td>
                    </tr>
                </table>

                <hr style="margin:25px 0;border:0;border-top:1px solid #eee;" />

                <h2>بخش درباره ما و فوتر</h2>
                <table class="form-table">
                    <tr>
                        <th><label for="aboutTitle">عنوان درباره ما:</label></th>
                        <td><input type="text" name="aboutTitle" id="aboutTitle" value="<?php echo esc_attr($about_title); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th><label for="aboutText">متن درباره ما:</label></th>
                        <td><textarea name="aboutText" id="aboutText" rows="4" class="large-text"><?php echo esc_textarea($about_text); ?></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="instagram">آدرس اینستاگرام:</label></th>
                        <td><input type="text" name="instagram" id="instagram" value="<?php echo esc_attr($instagram); ?>" class="regular-text" dir="ltr" placeholder="https://instagram.com/..." /></td>
                    </tr>
                    <tr>
                        <th><label for="youtube">کانال یوتیوب:</label></th>
                        <td><input type="text" name="youtube" id="youtube" value="<?php echo esc_attr($youtube); ?>" class="regular-text" dir="ltr" placeholder="https://youtube.com/..." /></td>
                    </tr>
                    <tr>
                        <th><label for="pond5">فروشگاه Pond5:</label></th>
                        <td><input type="text" name="pond5" id="pond5" value="<?php echo esc_attr($pond5); ?>" class="regular-text" dir="ltr" placeholder="https://pond5.com/artist/..." /></td>
                    </tr>
                </table>

                <p class="submit">
                    <button type="submit" name="studio_save_settings" class="button button-primary" style="padding:4px 20px;">ذخیره تنظیمات</button>
                </p>
            </form>
        </div>
        <?php
    }
}

Studio_Admin::init();

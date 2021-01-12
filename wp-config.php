<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'omc' );

/** MySQL database username */
define( 'DB_USER', 'administrador' );

/** MySQL database password */
define( 'DB_PASSWORD', 'administrador' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'LIvl@lq<^x$qKj-/hTZCi)^auni%%Z<@b0PkX?r=ZCm}2MM9 F3Y!,)f^.pe5-::' );
define( 'SECURE_AUTH_KEY',  'W8+DBO:~PqJq>+&_Po<WM. lAOR/A)216|UH6HTl/PajSo8C{5_ORzf8El~%+Vsk' );
define( 'LOGGED_IN_KEY',    '(AMmN 7r};5aku7,$ka0+h`xxlPFeDLywCiOgb/]Bg,f(/K~@nq?*gWe6*@uM7A;' );
define( 'NONCE_KEY',        'p1z=0?waJ:dfre]+MisZ@mq-o#;gAo1ssE<fq1LJMC!6!HN._v?/IGlZ~:W6;XzP' );
define( 'AUTH_SALT',        '}[f6A ^)3k=@`26>>!1Di;;}5Sq 0g[QBDK^vHlA-z|zr +BLHst,j^yO0Q|$xs|' );
define( 'SECURE_AUTH_SALT', 'M34_%+}S4`on$D8L}EoPx3{8WGX883yUSG6(wD8^sOc{!:Jmp>6d,_bY(I2]f3hL' );
define( 'LOGGED_IN_SALT',   ',/JY,E/is6{MbKKRh|FU=y>0~fc$)eq{IGP^_o?X3$GN}3TX]I$@HAC4+ImuI:rr' );
define( 'NONCE_SALT',       'gM>,S3N`jQ!U~5]tMl3z[U|MNwge{3DM7a@2<aQ?MF6(Q$j~|5q1(Pq.xk:>C#C~' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

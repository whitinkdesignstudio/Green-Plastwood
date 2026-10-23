<?php
/**
 * Greenplastwood — website form mailer (runs on the site's own cPanel hosting)
 * ---------------------------------------------------------------------------
 * Every form on the website posts here (assets/gp-config.js -> formEndpoint).
 *  1. The enquiry is e-mailed to the sales inbox (TO).
 *  2. If the visitor gave an e-mail address, they get an automatic reply with the details they filled.
 *  3. Every lead is also saved as a row in a CSV file (open it in Excel / Google Sheets).
 *
 * Nothing to install. Only change the settings below if the inbox or domain changes.
 */

/* ============================== SETTINGS ============================== */
$CONFIG = array(
  'TO'          => 'sales.executive11@sngecoindia.com',   // inbox that receives every enquiry
  'FROM'        => 'sales.executive11@sngecoindia.com',   // sender address (must be on this domain)
  'FROM_NAME'   => 'Greenplastwood',
  'AUTO_REPLY'  => true,                                   // "we have received your details" mail to the visitor
  'ALLOWED'     => array('sngecoindia.com', 'www.sngecoindia.com'),  // forms are accepted only from these sites
  'COMPANY'     => 'Greenplastwood',
  'LEGAL_NAME'  => 'SNG Eco India Pvt. Ltd.',
  'PHONE'       => '+91 90163 36119',
  'WHATSAPP'    => '919016336119',
  'ADDRESS'     => '1312, 1313, 1314, 13th Floor, Fortune Business Hub, Nr. Shell Petrol Pump, Science City Road, Sola, Ahmedabad 380060, Gujarat, India',
  'HOURS'       => 'Monday to Saturday, 9:30 AM to 6:30 PM',
  'BRAND'       => '#05838E',
  'DARK'        => '#0A393D',
  'MAX_PER_IP'  => 12,                                     // max submissions from one visitor in 10 minutes
);
/* ===================================================================== */

$FORM_NAMES = array(
  'contact_enquiry' => 'Contact page form', 'quick_quote' => 'Quick quote', 'sample_request' => 'Sample request',
  'dealer_enquiry' => 'Business associate enquiry', 'catalogue_request' => 'Catalogue request', 'brochure_request' => 'Brochure request',
  'certificate_request' => 'Certificates request', 'blog_enquiry' => 'Blog page enquiry', 'lp_quote' => 'Landing page form',
  'lp_quote_bottom' => 'Landing page form (bottom)', 'newsletter' => 'Newsletter sign-up',
);

date_default_timezone_set('Asia/Kolkata');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Content-Type: text/plain; charset=utf-8');
  echo 'Greenplastwood form mailer is running.';
  exit;
}
header('Content-Type: application/json; charset=utf-8');

function out($a) { echo json_encode($a); exit; }
function clean($v, $max = 2000) {
  $v = is_string($v) ? $v : '';
  $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v);
  $v = trim(preg_replace('/[ \t]+/u', ' ', $v));
  return function_exists('mb_substr') ? mb_substr($v, 0, $max, 'UTF-8') : substr($v, 0, $max);
}
function one_line($v) { return trim(preg_replace('/[\r\n]+/', ' ', $v)); }
function is_email($s) { return $s !== '' && strlen($s) <= 120 && filter_var($s, FILTER_VALIDATE_EMAIL) && !preg_match('/[\r\n]/', $s); }
function host_of($url) { $h = parse_url((string)$url, PHP_URL_HOST); return $h ? strtolower($h) : ''; }
function esc($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

/* ---------- read the form ---------- */
$p = array();
foreach ($_POST as $k => $v) {
  $k = substr(preg_replace('/[^A-Za-z0-9_]/', '', (string)$k), 0, 60);
  if ($k === '') continue;
  $v = clean($v, $k === 'message' ? 3000 : 500);
  if ($v !== '') $p[$k] = $v;
}
$g = function ($k) use (&$p) { return isset($p[$k]) ? $p[$k] : ''; };

/* ---------- checks ---------- */
if ($g('form_name') === '') out(array('ok' => false, 'error' => 'form'));
$origin = host_of(isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : (isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : $g('page_url')));
$pageHost = host_of($g('page_url'));
if (!in_array($origin, $CONFIG['ALLOWED'], true) && !in_array($pageHost, $CONFIG['ALLOWED'], true)) out(array('ok' => false, 'error' => 'site'));
$phone = $g('phone') !== '' ? $g('phone') : $g('mobile');
$email = $g('email');
if (strlen(preg_replace('/\D/', '', $phone)) < 8 && !is_email($email)) out(array('ok' => false, 'error' => 'contact'));

/* ---------- private folder for the lead file + limits ---------- */
$dir = dirname(__DIR__) . '/green-plastwood-leads';               // outside public_html (not reachable from the web)
if (!is_dir($dir)) @mkdir($dir, 0750, true);
if (!is_dir($dir) || !is_writable($dir)) {                         // fallback: a locked folder inside the site
  $dir = __DIR__ . '/leads-data';
  if (!is_dir($dir)) @mkdir($dir, 0750, true);
  if (!file_exists($dir . '/.htaccess')) @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
  if (!file_exists($dir . '/index.html')) @file_put_contents($dir . '/index.html', '');
}
$canWrite = is_dir($dir) && is_writable($dir);

if ($canWrite) {
  // rate limit per visitor
  $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0';
  $rl = $dir . '/.rate-' . md5($ip);
  $now = time(); $hits = array();
  if (file_exists($rl)) { foreach (explode(',', (string)@file_get_contents($rl)) as $t) { if ((int)$t > $now - 600) $hits[] = (int)$t; } }
  if (count($hits) >= $CONFIG['MAX_PER_IP']) out(array('ok' => false, 'error' => 'limit'));
  $hits[] = $now; @file_put_contents($rl, implode(',', $hits), LOCK_EX);
  // the same form from the same person twice within 2 minutes (double click, page reload) is sent once
  $dk = $dir . '/.dup-' . md5(implode('|', array($g('form_name'), $phone, $email, $g('productService') . $g('interestCategory'), $g('message'))));
  if (file_exists($dk) && filemtime($dk) > $now - 120) out(array('ok' => true, 'duplicate' => true));
  @touch($dk);
  foreach ((array)glob($dir . '/.dup-*') as $f) { if (@filemtime($f) < $now - 3600) @unlink($f); }
}

/* ---------- the lead ---------- */
$name = $g('fullName') !== '' ? $g('fullName') : ($g('name') !== '' ? $g('name') : trim($g('firstName') . ' ' . $g('surname')));
$city = $g('cityState') !== '' ? $g('cityState') : trim(implode(', ', array_filter(array($g('city'), $g('state')))));
$product = $g('productService') !== '' ? $g('productService') : ($g('interestCategory') !== '' ? $g('interestCategory') : $g('product'));
$form = $g('form_name');
$formLabel = isset($FORM_NAMES[$form]) ? $FORM_NAMES[$form] : $form;
$viaWa = $g('delivery') === 'whatsapp';
$category = $g('category') !== '' ? $g('category') : $g('customerType');

$rows = array_values(array_filter(array(
  array('Name', $name), array('Company', $g('companyName')), array('Mobile', $phone), array('E-mail', $email), array('City', $city),
  array('Category', $category), array('WPC user', $g('wpcUser')), array('Product', $product), array('Design', $g('designCode')),
  array('Request', $g('requestType')), array('Order quantity', $g('orderQuantity')), array('Nature of requirement', $g('natureOfRequirements')),
  array('Experience', $g('experience')), array('Website', $g('website')), array('Message', $g('message')),
), function ($r) { return $r[1] !== ''; }));

$source = array_values(array_filter(array(
  array('Form', $formLabel), array('Page', $g('page_title')), array('Page address', $g('page_url')),
  array('First page visited', $g('first_landing_page') !== '' ? $g('first_landing_page') : $g('landing_page')),
  array('Came from', $g('referrer')), array('Source', $g('utm_source')), array('Medium', $g('utm_medium')),
  array('Campaign', $g('utm_campaign')), array('Keyword', $g('utm_term')), array('Ad content', $g('utm_content')),
  array('Google Ads click', ($g('gclid') . $g('gbraid') . $g('wbraid')) !== '' ? 'Yes' : ''), array('Meta Ads click', $g('fbclid') !== '' ? 'Yes' : ''),
  array('Received', date('d M Y, h:i A') . ' IST'),
), function ($r) { return $r[1] !== ''; }));

/* ---------- e-mail helpers ---------- */
function table_html($rows) {
  $h = '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#231F1D;">';
  foreach ($rows as $r) {
    $h .= '<tr><td style="padding:9px 14px 9px 0;border-bottom:1px solid #E5DFD7;color:#6E6663;width:170px;vertical-align:top;">' . esc($r[0]) . '</td>'
        . '<td style="padding:9px 0;border-bottom:1px solid #E5DFD7;vertical-align:top;">' . nl2br(esc($r[1])) . '</td></tr>';
  }
  return $h . '</table>';
}
function table_text($rows) { $o = array(); foreach ($rows as $r) $o[] = $r[0] . ': ' . $r[1]; return implode("\n", $o); }
function shell_html($heading, $inner, $C) {
  return '<div style="background:#F6F4EF;padding:24px 12px;"><div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #E5DFD7;border-radius:10px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">'
    . '<div style="background:' . $C['DARK'] . ';color:#ffffff;padding:20px 26px;font-size:20px;font-weight:bold;">' . esc($heading) . '</div>'
    . '<div style="padding:24px 26px;color:#231F1D;font-size:15px;line-height:1.6;">' . $inner . '</div></div></div>';
}
function send_mail($to, $subject, $text, $html, $C, $replyTo = '') {
  $boundary = 'gp_' . md5(uniqid('', true));
  $fromName = '=?UTF-8?B?' . base64_encode($C['FROM_NAME']) . '?=';
  $headers = array(
    'From: ' . $fromName . ' <' . $C['FROM'] . '>',
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    'X-Mailer: Greenplastwood website',
  );
  if ($replyTo !== '' && is_email($replyTo)) $headers[] = 'Reply-To: ' . $replyTo;
  $body = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text))
        . "--$boundary\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode('<!doctype html><html><body style="margin:0;">' . $html . '</body></html>'))
        . "--$boundary--\r\n";
  $subj = '=?UTF-8?B?' . base64_encode(function_exists('mb_substr') ? mb_substr(one_line($subject), 0, 170, 'UTF-8') : substr(one_line($subject), 0, 170)) . '?=';
  return @mail($to, $subj, $body, implode("\r\n", $headers), '-f' . $C['FROM']);
}

/* ---------- 1. e-mail to the sales inbox ---------- */
$C = $CONFIG;
$subject = $form === 'newsletter' ? 'Newsletter sign-up: ' . $email
  : 'Website enquiry: ' . ($name !== '' ? $name : ($g('companyName') !== '' ? $g('companyName') : ($phone !== '' ? $phone : $email)))
    . ($city !== '' ? ' (' . $city . ')' : '') . ($product !== '' ? ' - ' . $product : '');
$wa = $viaWa ? '<p style="margin:0 0 16px;padding:10px 14px;background:#E5F1F2;border-radius:6px;">This visitor filled a pop-up form and was taken to WhatsApp with the same details. If no WhatsApp message came from this number, please call.</p>' : '';
$digits = preg_replace('/\D/', '', $phone);
$actions = $digits !== '' ? '<p style="margin:18px 0 0;"><a href="tel:' . esc(preg_replace('/[^\d+]/', '', $phone)) . '" style="color:' . $C['BRAND'] . ';font-weight:bold;">Call ' . esc($phone) . '</a>'
  . ' &nbsp;|&nbsp; <a href="https://wa.me/' . (strlen($digits) === 10 ? '91' . $digits : $digits) . '" style="color:' . $C['BRAND'] . ';font-weight:bold;">WhatsApp</a>'
  . (is_email($email) ? ' &nbsp;|&nbsp; reply to this e-mail to write to the customer' : '') . '</p>' : '';
$html = shell_html($form === 'newsletter' ? 'Newsletter sign-up' : 'New website enquiry',
  $wa . table_html($rows) . $actions . '<p style="margin:26px 0 8px;font-weight:bold;color:#6E6663;font-size:13px;">WHERE THIS LEAD CAME FROM</p>' . table_html($source), $C);
$text = ($viaWa ? "Pop-up form, visitor was taken to WhatsApp.\n\n" : '') . table_text($rows) . "\n\n" . table_text($source);
$sent = send_mail($C['TO'], $subject, $text, $html, $C, is_email($email) ? $email : '');

/* ---------- 2. automatic reply to the visitor ---------- */
$replied = false;
if ($C['AUTO_REPLY'] && $form !== 'newsletter' && is_email($email)) {
  $first = explode(' ', $name !== '' ? $name : 'Customer'); $first = $first[0];
  $hello = 'Dear ' . $first . ',';
  $intro = 'Thank you for contacting ' . $C['COMPANY'] . '. We have received your details and our team will get back to you shortly.';
  $rhtml = shell_html('We have received your enquiry',
    '<p style="margin:0 0 12px;">' . esc($hello) . '</p><p style="margin:0 0 20px;">' . esc($intro) . '</p>'
    . '<p style="margin:0 0 8px;font-weight:bold;color:#6E6663;font-size:13px;">YOUR DETAILS</p>' . table_html($rows)
    . '<p style="margin:22px 0 8px;">If anything above is not correct, or you need a faster reply, please reach us here:</p>'
    . '<p style="margin:0 0 4px;"><a href="tel:' . esc(preg_replace('/[^\d+]/', '', $C['PHONE'])) . '" style="color:' . $C['BRAND'] . ';font-weight:bold;">' . esc($C['PHONE']) . '</a>'
    . ' &nbsp;|&nbsp; <a href="https://wa.me/' . $C['WHATSAPP'] . '" style="color:' . $C['BRAND'] . ';font-weight:bold;">WhatsApp</a>'
    . ' &nbsp;|&nbsp; <a href="mailto:' . esc($C['TO']) . '" style="color:' . $C['BRAND'] . ';font-weight:bold;">' . esc($C['TO']) . '</a></p>'
    . '<p style="margin:22px 0 0;">Regards,<br><strong>' . esc($C['COMPANY']) . '</strong><br><span style="color:#6E6663;font-size:13px;">' . esc($C['LEGAL_NAME']) . '<br>' . esc($C['ADDRESS']) . '<br>' . esc($C['HOURS']) . '</span></p>', $C);
  $rtext = $hello . "\n\n" . $intro . "\n\nYOUR DETAILS\n" . table_text($rows)
    . "\n\nCall: " . $C['PHONE'] . "\nWhatsApp: https://wa.me/" . $C['WHATSAPP'] . "\nE-mail: " . $C['TO'] . "\nOffice: " . $C['ADDRESS'] . "\nHours: " . $C['HOURS']
    . "\n\nRegards,\n" . $C['COMPANY'] . "\n" . $C['LEGAL_NAME'];
  $replied = send_mail($email, 'We have received your enquiry | ' . $C['COMPANY'], $rtext, $rhtml, $C, $C['TO']);
}

/* ---------- 3. save the lead (CSV, opens in Excel) ---------- */
if ($canWrite) {
  $file = $dir . '/leads.csv';
  $isNew = !file_exists($file);
  $cell = function ($v) { $v = (string)$v; return preg_match('/^[=+\-@]/', $v) ? "'" . $v : $v; };   // never let a value run as a formula
  $fh = @fopen($file, 'a');
  if ($fh) {
    @flock($fh, LOCK_EX);
    if ($isNew) { fwrite($fh, "\xEF\xBB\xBF"); fputcsv($fh, array('Received (IST)', 'Form', 'Name', 'Mobile', 'E-mail', 'City', 'Company', 'Category', 'WPC user', 'Product', 'Design', 'Request',
      'Quantity', 'Requirement', 'Message', 'Via WhatsApp', 'Mail sent', 'Auto-reply sent', 'Page', 'Source', 'Medium', 'Campaign', 'Keyword', 'Google click ID', 'Meta click ID', 'First page', 'Came from')); }
    fputcsv($fh, array_map($cell, array(date('Y-m-d H:i'), $formLabel, $name, $phone, $email, $city, $g('companyName'), $category, $g('wpcUser'), $product, $g('designCode'), $g('requestType'),
      $g('orderQuantity'), $g('natureOfRequirements'), $g('message'), $viaWa ? 'Yes' : '', $sent ? 'Yes' : 'NO', $replied ? 'Yes' : '', $g('page_url'), $g('utm_source'), $g('utm_medium'),
      $g('utm_campaign'), $g('utm_term'), $g('gclid') . $g('gbraid') . $g('wbraid'), $g('fbclid'), $g('first_landing_page'), $g('referrer'))));
    @flock($fh, LOCK_UN); fclose($fh);
  }
}

out(array('ok' => (bool)$sent, 'autoReply' => $replied, 'saved' => $canWrite));

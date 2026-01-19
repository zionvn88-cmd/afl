// Network configurations for affiliate networks
export const NETWORKS = [
  // ===== INTERNATIONAL NETWORKS (Popular in Vietnam) =====
  {
    id: 'maxbounty',
    name: 'MaxBounty',
    clickParam: 's1',
    offerUrlTemplate: 'https://maxbounty.com/track.php?aff_id=YOUR_AFF_ID&camp_id=YOUR_CAMP_ID&s1={click_id}',
    postbackParams: ['s1', 'payout', 'status'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={s1}&payout={payout}&status={status}',
    logo: 'https://cdn.simpleicons.org/maxcdn/FF6600',
    category: 'International',
    instructions: `
1. Đăng nhập MaxBounty → Account Settings
2. Nhập Postback URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={s1}&payout={payout}&status={status}
3. Lấy tracking link từ offer, thêm &s1={click_id} vào cuối
    `
  },
  {
    id: 'clickbank',
    name: 'ClickBank',
    clickParam: 'tid',
    offerUrlTemplate: 'https://YOUR_VENDOR.pay.clickbank.net/?tid={click_id}',
    postbackParams: ['tid', 'amount', 'receipt'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={tid}&payout={amount}&txn_id={receipt}',
    logo: 'https://cdn.simpleicons.org/clickup/7B68EE',
    category: 'International',
    instructions: `
1. Đăng nhập ClickBank → Account Settings → My Site
2. Add Postback URL (IPN):
   https://YOUR_TRACKER_DOMAIN/postback?click_id={tid}&payout={amount}&txn_id={receipt}
3. Dùng HopLink với ?tid={click_id}
    `
  },
  {
    id: 'cj',
    name: 'CJ Affiliate (Commission Junction)',
    clickParam: 'sid',
    offerUrlTemplate: 'https://www.tkqlhce.com/click-YOUR_PID-YOUR_AID?sid={click_id}',
    postbackParams: ['sid', 'amount', 'orderId'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={sid}&payout={amount}&order_id={orderId}',
    logo: 'https://cdn.simpleicons.org/cookie/0077B5',
    category: 'International',
    instructions: `
1. CJ Account → Account Settings → Postback URL
2. Nhập:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={sid}&payout={amount}&order_id={orderId}
3. Thêm &sid={click_id} vào tracking link
    `
  },
  {
    id: 'peerfly',
    name: 'PeerFly',
    clickParam: 'aff_sub',
    offerUrlTemplate: 'https://peerfly.com/programs/YOUR_PROGRAM?aff_sub={click_id}',
    postbackParams: ['aff_sub', 'payout', 'status'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={aff_sub}&payout={payout}&status={status}',
    logo: 'https://cdn.simpleicons.org/pypi/3775A9',
    category: 'International',
    instructions: `
1. PeerFly Dashboard → Settings → Postback
2. Global Postback URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={aff_sub}&payout={payout}&status={status}
3. Dùng aff_sub={click_id} trong tracking link
    `
  },
  {
    id: 'admitad',
    name: 'Admitad',
    clickParam: 'subid',
    offerUrlTemplate: 'https://ad.admitad.com/g/YOUR_HASH/?subid={click_id}',
    postbackParams: ['subid', 'payment', 'status'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={subid}&payout={payment}&status={status}',
    logo: 'https://cdn.simpleicons.org/adidas/000000',
    category: 'International',
    instructions: `
1. Admitad → Tools → Postback
2. Add URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={subid}&payout={payment}&status={status}
3. Thêm &subid={click_id} vào deeplink
    `
  },
  {
    id: 'shareasale',
    name: 'ShareASale',
    clickParam: 'afftrack',
    offerUrlTemplate: 'https://www.shareasale.com/r.cfm?b=YOUR_BANNER&u=YOUR_ID&m=YOUR_MERCHANT&afftrack={click_id}',
    postbackParams: ['afftrack', 'amount', 'transId'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={afftrack}&payout={amount}&txn_id={transId}',
    logo: 'https://cdn.simpleicons.org/sharex/1E88E5',
    category: 'International',
    instructions: `
1. ShareASale → Account Settings → Postback
2. Server Postback URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={afftrack}&payout={amount}&txn_id={transId}
3. Dùng afftrack={click_id} trong link
    `
  },
  {
    id: 'impact',
    name: 'Impact',
    clickParam: 'subid1',
    offerUrlTemplate: 'https://YOUR_BRAND.sjv.io/c/YOUR_ID/YOUR_SUBID/YOUR_PAGE?subid1={click_id}',
    postbackParams: ['subid1', 'amount', 'orderId'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={subid1}&payout={amount}&order_id={orderId}',
    logo: 'https://cdn.simpleicons.org/impala/FF6B35',
    category: 'International',
    instructions: `
1. Impact Partnership Cloud → Settings → Tracking
2. Conversion Tracking URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={subid1}&payout={amount}&order_id={orderId}
3. Thêm ?subid1={click_id} vào link
    `
  },
  {
    id: 'awin',
    name: 'Awin',
    clickParam: 'clickref',
    offerUrlTemplate: 'https://www.awin1.com/cread.php?awinmid=YOUR_MID&awinaffid=YOUR_AFF&clickref={click_id}',
    postbackParams: ['clickref', 'commission', 'transactionId'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={clickref}&payout={commission}&txn_id={transactionId}',
    logo: 'https://cdn.simpleicons.org/awesomewm/535D6C',
    category: 'International',
    instructions: `
1. Awin → Settings → Tracking Integration
2. Postback URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={clickref}&payout={commission}&txn_id={transactionId}
3. Dùng &clickref={click_id} trong tracking link
    `
  },
  {
    id: 'rakuten',
    name: 'Rakuten Advertising',
    clickParam: 'u1',
    offerUrlTemplate: 'https://click.linksynergy.com/deeplink?id=YOUR_ID&mid=YOUR_MID&u1={click_id}',
    postbackParams: ['u1', 'amount', 'orderId'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={u1}&payout={amount}&order_id={orderId}',
    logo: 'https://cdn.simpleicons.org/rakuten/BF0000',
    category: 'International',
    instructions: `
1. Rakuten → Settings → Conversion Tracking
2. Server-to-Server Postback:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={u1}&payout={amount}&order_id={orderId}
3. Thêm &u1={click_id} vào tracking link
    `
  },
  {
    id: 'partnerstack',
    name: 'PartnerStack',
    clickParam: 'via',
    offerUrlTemplate: 'https://YOUR_COMPANY.com/?via={click_id}',
    postbackParams: ['via', 'amount', 'referenceId'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={via}&payout={amount}&ref_id={referenceId}',
    logo: 'https://cdn.simpleicons.org/stackshare/0690FA',
    category: 'SaaS',
    instructions: `
1. PartnerStack Dashboard → Settings → Webhooks
2. Add Webhook URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={via}&payout={amount}&ref_id={referenceId}
3. Dùng ?via={click_id} trong referral link
    `
  },
  {
    id: 'digistore24',
    name: 'Digistore24',
    clickParam: 'affid',
    offerUrlTemplate: 'https://www.digistore24.com/redir/YOUR_PRODUCT_ID/YOUR_AFFILIATE/?affid={click_id}',
    postbackParams: ['affid', 'amount', 'orderId'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={affid}&payout={amount}&order_id={orderId}',
    logo: 'https://cdn.simpleicons.org/digitalocean/0080FF',
    category: 'International',
    instructions: `
1. Digistore24 → Account → IPN Settings
2. IPN URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={affid}&payout={amount}&order_id={orderId}
3. Thêm /?affid={click_id} vào affiliate link
    `
  },
  {
    id: 'warriorplus',
    name: 'WarriorPlus',
    clickParam: 'tid',
    offerUrlTemplate: 'https://warriorplus.com/o2/a/YOUR_ID/0?tid={click_id}',
    postbackParams: ['tid', 'amount', 'receipt'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={tid}&payout={amount}&txn_id={receipt}',
    logo: 'https://cdn.simpleicons.org/wordpress/21759B',
    category: 'Digital Products',
    instructions: `
1. WarriorPlus → Settings → IPN Settings
2. Instant Payment Notification URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={tid}&payout={amount}&txn_id={receipt}
3. Thêm ?tid={click_id} vào hop link
    `
  },
  {
    id: 'jvzoo',
    name: 'JVZoo',
    clickParam: 'tid',
    offerUrlTemplate: 'https://www.jvzoo.com/c/YOUR_AFFILIATE_ID/YOUR_PRODUCT_ID?tid={click_id}',
    postbackParams: ['tid', 'amount', 'receipt'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={tid}&payout={amount}&txn_id={receipt}',
    logo: 'https://cdn.simpleicons.org/jamstack/F0047F',
    category: 'Digital Products',
    instructions: `
1. JVZoo → Account Settings → IPN
2. Add IPN URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={tid}&payout={amount}&txn_id={receipt}
3. Dùng ?tid={click_id} trong affiliate link
    `
  },
  {
    id: 'flexoffers',
    name: 'FlexOffers',
    clickParam: 'SID',
    offerUrlTemplate: 'https://track.flexlinkspro.com/a.ashx?foid=YOUR_FOID&fot=YOUR_FOT&foc=YOUR_FOC&SID={click_id}',
    postbackParams: ['SID', 'amount', 'transactionId'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={SID}&payout={amount}&txn_id={transactionId}',
    logo: 'https://cdn.simpleicons.org/flex/2196F3',
    category: 'International',
    instructions: `
1. FlexOffers → Tools → Postback Settings
2. Postback URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={SID}&payout={amount}&txn_id={transactionId}
3. Thêm &SID={click_id} vào tracking link
    `
  },
  {
    id: 'tradedoubler',
    name: 'TradeDoubler',
    clickParam: 'epi',
    offerUrlTemplate: 'https://clk.tradedoubler.com/click?p=YOUR_PROGRAM&a=YOUR_AFFILIATE&epi={click_id}',
    postbackParams: ['epi', 'orderValue', 'orderNumber'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={epi}&payout={orderValue}&order_id={orderNumber}',
    logo: 'https://cdn.simpleicons.org/travisci/3EAAAF',
    category: 'International',
    instructions: `
1. TradeDoubler → Settings → Event Tracking
2. Postback URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={epi}&payout={orderValue}&order_id={orderNumber}
3. Thêm &epi={click_id} vào tracking link
    `
  },
  
  // ===== VIETNAM NETWORKS =====
  {
    id: 'accesstrade',
    name: 'AccessTrade VN',
    clickParam: 'aff_sub',
    offerUrlTemplate: 'https://fast.accesstrade.com.vn/deep_link/YOUR_LINK?aff_sub={click_id}',
    postbackParams: ['aff_sub', 'commission', 'order_id'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={aff_sub}&payout={commission}&order_id={order_id}',
    logo: '🇻🇳',
    category: 'Vietnam',
    instructions: `
1. AccessTrade VN → Cài Đặt → Postback
2. URL Postback:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={aff_sub}&payout={commission}&order_id={order_id}
3. Thêm ?aff_sub={click_id} vào deeplink
    `
  },
  {
    id: 'fmarket',
    name: 'FMarket (Fiin Group)',
    clickParam: 'sub_id',
    offerUrlTemplate: 'https://fmarket.vn/r/YOUR_CAMPAIGN?sub_id={click_id}',
    postbackParams: ['sub_id', 'revenue', 'order_code'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={sub_id}&payout={revenue}&order_id={order_code}',
    logo: '🇻🇳',
    category: 'Vietnam',
    instructions: `
1. FMarket → Tài Khoản → Postback Conversion
2. URL Postback:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={sub_id}&payout={revenue}&order_id={order_code}
3. Thêm ?sub_id={click_id} vào link affiliate
    `
  },
  {
    id: 'cake',
    name: 'CAKE Marketing',
    clickParam: 's1',
    offerUrlTemplate: 'https://YOUR_DOMAIN.com/YOUR_OFFER?s1={click_id}',
    postbackParams: ['s1', 'received_amount', 'transaction_id'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={s1}&payout={received_amount}&txn_id={transaction_id}',
    logo: 'https://cdn.simpleicons.org/cakephp/D33C43',
    category: 'Tracking Platform',
    instructions: `
1. CAKE → Campaigns → Postback URLs
2. Affiliate Postback:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={s1}&payout={received_amount}&txn_id={transaction_id}
3. Thêm &s1={click_id} vào offer URL
    `
  },
  {
    id: 'everflow',
    name: 'Everflow',
    clickParam: 'sub1',
    offerUrlTemplate: 'https://YOUR_NETWORK.go2cloud.org/aff_c?offer_id=YOUR_OFFER&aff_id=YOUR_ID&sub1={click_id}',
    postbackParams: ['sub1', 'payout', 'transaction_id'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={sub1}&payout={payout}&txn_id={transaction_id}',
    logo: 'https://cdn.simpleicons.org/eventstore/5AB552',
    category: 'Tracking Platform',
    instructions: `
1. Everflow → Settings → Global Postback
2. Affiliate Postback URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={sub1}&payout={payout}&txn_id={transaction_id}
3. Dùng &sub1={click_id} trong tracking link
    `
  },
  {
    id: 'hasoffers',
    name: 'HasOffers (TUNE)',
    clickParam: 'aff_sub',
    offerUrlTemplate: 'https://YOUR_NETWORK.tracking.com/aff_c?offer_id=YOUR_OFFER&aff_id=YOUR_ID&aff_sub={click_id}',
    postbackParams: ['aff_sub', 'payout', 'sale_amount'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={aff_sub}&payout={payout}&amount={sale_amount}',
    logo: 'https://cdn.simpleicons.org/hotjar/FF3C00',
    category: 'Tracking Platform',
    instructions: `
1. HasOffers → Account → Postback URL
2. Global Postback:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={aff_sub}&payout={payout}&amount={sale_amount}
3. Thêm &aff_sub={click_id} vào offer link
    `
  },
  {
    id: 'voluum',
    name: 'Voluum (as Affiliate Network)',
    clickParam: 'cid',
    offerUrlTemplate: 'https://YOUR_DOMAIN.com/YOUR_PATH?cid={click_id}',
    postbackParams: ['cid', 'payout', 'txid'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={cid}&payout={payout}&txn_id={txid}',
    logo: 'https://cdn.simpleicons.org/v/0078D7',
    category: 'Tracking Platform',
    instructions: `
1. Voluum → Settings → Postback
2. Conversion Postback URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={cid}&payout={payout}&txn_id={txid}
3. Dùng {cid} token trong offer URL
    `
  },
  {
    id: 'custom',
    name: 'Custom Network',
    clickParam: 'click_id',
    offerUrlTemplate: 'https://network.com/offer?aff_id=123&sub_id={click_id}',
    postbackParams: ['click_id', 'payout', 'status'],
    postbackTemplate: 'https://YOUR_TRACKER_DOMAIN/postback?click_id={click_id}&payout={payout}&status={status}',
    logo: '🔧',
    category: 'Custom',
    instructions: `
1. Liên hệ affiliate manager để setup postback
2. Cung cấp Postback URL:
   https://YOUR_TRACKER_DOMAIN/postback?click_id={click_id}&payout={payout}&status={status}
3. Tự điều chỉnh tracking param phù hợp với network
    `
  }
];

// Get network by ID
export function getNetwork(id) {
  return NETWORKS.find(n => n.id === id);
}

// Generate postback URL for network
export function generatePostbackUrl(networkId, trackerDomain = 'afl-tracker.pages.dev') {
  const network = getNetwork(networkId);
  if (!network) return '';
  
  return network.postbackTemplate.replace('YOUR_TRACKER_DOMAIN', trackerDomain);
}

// Generate offer URL template for network
export function generateOfferUrlTemplate(networkId) {
  const network = getNetwork(networkId);
  if (!network) return '';
  
  return network.offerUrlTemplate;
}

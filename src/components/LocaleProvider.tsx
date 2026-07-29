'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Exchange rates relative to USD (approximate)
const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

// Translations
const T: Record<string, Record<string, string>> = {
  EN: {
    home: 'Home', all_products: 'All Products', about_us: 'About Us',
    search: 'Search products...', cart: 'Cart', account: 'Account',
    add_to_cart: 'ADD TO CART', buy_now: 'Buy Now', checkout: 'Checkout',
    view_cart: 'View Cart', continue_shopping: 'Continue Shopping',
    your_bag: 'YOUR BAG', order_summary: 'Order Summary',
    subtotal: 'Subtotal', shipping: 'Shipping', tax: 'Tax', total: 'Total',
    free: 'FREE', place_order: 'Place Order', contact: 'Contact',
    get_in_touch: 'Get in touch.',
    navigate: 'Navigate', official: 'Official', social: 'Social',
    privacy: 'Privacy Policy', terms: 'Terms & Conditions',
    shipping_policy: 'Shipping Policy', refunds: 'Cancellations & Refunds',
    secure_checkout: 'Secure Checkout', happy_customers: '5,000+ Happy Customers',
    support: '24/7 Support', premium_quality: 'Premium Quality',
    shop_collection: 'Shop the Collection', view_all: 'View All',
    how_it_works: 'How Drift Pad works', featured: 'Featured',
    story: 'THE STORY', plug_in: 'Plug it in', place_car: 'Place your car',
    enjoy_drift: 'Enjoy the drift', usb_power: 'Simple USB power connection.',
    works_all: 'Works with all 1:64 scale cars.',
    smooth_360: 'Smooth 360° drifting experience.',
    reviews: 'reviews', quantity: 'Quantity', no_products: 'No products available yet.',
    cart_empty: 'Your cart is empty.',
    see_action: 'SEE DRIFTPAD IN ACTION',
    how_works_desc: 'A motorized display that spins your 1:64 miniature cars in a continuous drift loop — right on your desk.',
    no_banners: 'No active banners', add_banners: 'Add banners in Admin → Banners',
    shop_now: 'Shop Now', how_works_btn: 'How it works',
    footer_desc: 'Premium motorised drifting displays for 1:64 diecast collectors.',
    copyright: 'Urban Garage. All rights reserved.',
    no_reviews: 'No reviews yet. Be the first to review this product!',
    customer_reviews: 'Customer Reviews',
    you_may_like: 'You May Also Like',
    save: 'Save', sold_out: 'SOLD OUT', sale: 'SALE', hot: 'HOT', limited: 'LIMITED', new: 'NEW',
    sort_default: 'Default', sort_price_low: 'Price: Low-High', sort_price_high: 'Price: High-Low', sort_name: 'Name',
    sort_label: 'Sort:', all: 'All',
    shipping_info: 'Shipping Information', full_name: 'Full Name *', email: 'Email *',
    phone: 'Phone', country_region: 'Country / Region *', address: 'Address *',
    city_label: 'City *', state_label: 'State *', zip_label: 'ZIP Code *',
    order_confirmed: 'Order Confirmed!', thank_you: 'Thank you for your order.',
    order_number: 'Order',
    you_save: 'Save',
    qty: 'Qty',
    ship_free_over: 'Add {0} more for free shipping',
    we_contact: 'Payment will be collected separately. We\'ll contact you.',
    login: 'Log in', register: 'Create Account', logout: 'Log out',
    my_account: 'My Account', profile: 'Profile',
    name: 'Name', password: 'Password',
    welcome_back: 'Welcome back to Urban Garage.',
    join: 'Join Urban Garage.',
    no_account: 'Don\'t have an account?', has_account: 'Already have an account?',
    create_one: 'Create one', login_instead: 'Log in',
    send_note: 'Send a note',
  },
  ZH: {
    home: '首页', all_products: '全部商品', about_us: '关于我们',
    search: '搜索产品...', cart: '购物车', account: '账户',
    add_to_cart: '加入购物车', buy_now: '立即购买', checkout: '结算',
    view_cart: '查看购物车', continue_shopping: '继续购物',
    your_bag: '购物袋', order_summary: '订单摘要',
    subtotal: '小计', shipping: '运费', tax: '税费', total: '总计',
    free: '免费', place_order: '提交订单', contact: '联系我们',
    get_in_touch: '取得联系',
    navigate: '导航', official: '官方', social: '社交',
    privacy: '隐私政策', terms: '条款条件',
    shipping_policy: '配送政策', refunds: '退换货政策',
    secure_checkout: '安全支付', happy_customers: '5000+ 满意客户',
    support: '24/7 客服', premium_quality: '优质品质',
    shop_collection: '选购系列', view_all: '查看全部',
    how_it_works: '如何使用', featured: '精选',
    story: '品牌故事', plug_in: '插入电源', place_car: '放置车辆',
    enjoy_drift: '享受漂移', usb_power: '简单USB供电',
    works_all: '适用于所有 1:64 比例车辆',
    smooth_360: '流畅 360° 漂移体验',
    reviews: '评价', quantity: '数量', no_products: '暂无商品',
    cart_empty: '购物车为空',
    see_action: '观看展示视频',
    how_works_desc: '一款电动展示台，让您的 1:64 微型车在桌面上连续漂移旋转。',
    no_banners: '暂无横幅', add_banners: '请在后台 → Banner 中添加',
    shop_now: '立即选购', how_works_btn: '如何使用',
    footer_desc: '为 1:64 模型车收藏家打造的优质电动漂移展示台。',
    copyright: 'Urban Garage 版权所有',
    no_reviews: '暂无评论，成为第一个评论的人！',
    customer_reviews: '客户评价',
    you_may_like: '你可能还喜欢',
    save: '节省', sold_out: '售罄', sale: '促销', hot: '热卖', limited: '限量', new: '新品',
    sort_default: '默认', sort_price_low: '价格：低到高', sort_price_high: '价格：高到低', sort_name: '名称',
    sort_label: '排序：', all: '全部',
    shipping_info: '配送信息', full_name: '姓名 *', email: '邮箱 *',
    phone: '电话', country_region: '国家/地区 *', address: '地址 *',
    city_label: '城市 *', state_label: '省/州 *', zip_label: '邮编 *',
    order_confirmed: '订单已确认！', thank_you: '感谢您的购买。',
    order_number: '订单号',
    you_save: '省',
    qty: '数量',
    ship_free_over: '再加 {0} 免运费',
    we_contact: '支付将另行处理，我们会联系您。',
    login: '登录', register: '注册', logout: '退出',
    my_account: '我的账户', profile: '个人资料',
    name: '姓名', password: '密码',
    welcome_back: '欢迎回到 Urban Garage。',
    join: '加入 Urban Garage。',
    no_account: '还没有账户？', has_account: '已有账户？',
    create_one: '创建一个', login_instead: '去登录',
    send_note: '发送消息',
  },
};

interface LocaleContextType {
  lang: string;
  setLang: (l: string) => void;
  currency: string;
  setCurrency: (c: string) => void;
  t: (key: string, ...args: string[]) => string;
  convertPrice: (usdPrice: number) => number;
  formatPrice: (usdPrice: number) => string;
  currencySymbol: string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState('EN');
  const [currency, setCurrencyState] = useState('USD');

  useEffect(() => {
    setLangState(localStorage.getItem('ug-lang') || 'EN');
    setCurrencyState(localStorage.getItem('ug-currency') || 'USD');
  }, []);

  const setLang = (l: string) => { setLangState(l); localStorage.setItem('ug-lang', l); };
  const setCurrency = (c: string) => { setCurrencyState(c); localStorage.setItem('ug-currency', c); };

  const t = (key: string, ...args: string[]) => {
    const translations = T[lang] || T.EN;
    let text = translations[key] || T.EN[key] || key;
    args.forEach((arg, i) => { text = text.replace(`{${i}}`, arg); });
    return text;
  };

  const convertPrice = (usdPrice: number) => {
    const rate = RATES[currency] || 1;
    return Math.round(usdPrice * rate * 100) / 100;
  };

  const formatPrice = (usdPrice: number) => {
    const converted = convertPrice(usdPrice);
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    const sym = symbols[currency] || '$';
    return `${sym}${converted.toFixed(2)}`;
  };

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  return (
    <LocaleContext.Provider value={{ lang, setLang, currency, setCurrency, t, convertPrice, formatPrice, currencySymbol }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale outside provider');
  return ctx;
}

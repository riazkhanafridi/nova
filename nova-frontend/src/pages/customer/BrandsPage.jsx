import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { getMediaUrl } from '../../lib/media';

export default function BrandsPage() {
  const { data: brandsData } = useFetch('/brands');
  const { data: productsData } = useFetch('/products', { params: { limit: 200 } });

  const brands = brandsData?.data || [];
  const products = productsData?.data?.products || [];

  const brandCounts = products.reduce((acc, product) => {
    const brandId = product.brandId || product.Brand?.brandId;
    if (!brandId) return acc;
    acc[brandId] = (acc[brandId] || 0) + 1;
    return acc;
  }, {});

  const featuredPartners = brands.slice(0, 3).map((brand, index) => ({
    name: brand.name,
    tagline: brand.description || 'Trusted quality for everyday tech.',
    count: `${brandCounts[brand.brandId] || 0}+ PRODUCTS`,
    description: brand.description || `Shop ${brand.name} essentials built for speed, reliability, and daily performance.`,
    image: getMediaUrl(brand.logo) || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
    link: `/products?brand=${brand.slug}`,
    buttonText: `Shop ${brand.name}`,
    theme: index % 2 === 0 ? 'light' : 'dark',
    imagePosition: index % 2 === 0 ? 'left' : 'right'
  }));

  const allDirectoryBrands = brands.map((brand) => ({
    name: brand.name,
    slug: brand.slug,
    category: brand.description || 'Premium Electronics',
    count: `${brandCounts[brand.brandId] || 0}+`,
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 max-w-7xl">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#FFF0E6] via-[#FFD4B8] to-[#FF6B2B] p-8 sm:p-12 lg:p-14 border border-orange-100/60 shadow-xs group">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-orange-200/80 text-orange-600 font-bold text-xs tracking-wider uppercase backdrop-blur-sm shadow-xs mb-6 group-hover:scale-105 transition-transform duration-300">
            NOVA PARTNERS
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 leading-tight mb-4">
            Premium Brands
          </h1>
          <p className="text-neutral-700 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
            We partner only with brands that meet our standard for quality, innovation, and reliability.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-200/70 shadow-xs">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-orange-600 uppercase mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> BRAND SPOTLIGHT
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Our Featured Partners
            </h2>
          </div>
        </div>

        <div className="space-y-8">
          {featuredPartners.map((partner, idx) => {
            const isDark = partner.theme === 'dark';
            const isImageRight = partner.imagePosition === 'right';

            return (
              <div
                key={idx}
                className={`group relative grid grid-cols-1 lg:grid-cols-2 rounded-[2rem] overflow-hidden border shadow-xs hover:shadow-2xl hover:shadow-orange-500/15 hover:border-orange-500/60 hover:-translate-y-1 transition-all duration-500 ${
                  isDark ? 'bg-[#18181B] border-neutral-800' : 'bg-[#FAFAFA] border-neutral-200/60'
                }`}
              >
                <div
                  className={`relative h-64 sm:h-80 lg:h-auto overflow-hidden ${
                    isImageRight ? 'order-1 lg:order-2' : 'order-1'
                  }`}
                >
                  <img
                    src={partner.image}
                    alt={partner.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80';
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      isDark
                        ? 'bg-gradient-to-t from-[#18181B]/40 via-transparent to-transparent'
                        : 'bg-gradient-to-t from-black/20 via-transparent to-transparent'
                    }`}
                  />
                </div>

                <div
                  className={`p-8 sm:p-10 lg:p-12 flex flex-col justify-center items-start transition-colors duration-500 ${
                    isImageRight ? 'order-2 lg:order-1' : 'order-2'
                  } ${
                    isDark
                      ? 'bg-[#18181B] group-hover:bg-[#202024]'
                      : 'bg-[#F8F9FA]/80 group-hover:bg-white'
                  }`}
                >
                  <span
                    className={`text-xs font-bold tracking-wider uppercase mb-2 px-3.5 py-1 rounded-full border transform group-hover:scale-105 transition-transform duration-300 ${
                      isDark
                        ? 'text-orange-500 bg-orange-950/60 border-orange-800/60'
                        : 'text-orange-600 bg-orange-100/60 border-orange-200/60'
                    }`}
                  >
                    {partner.count}
                  </span>
                  <h3
                    className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-1 transition-colors duration-300 ${
                      isDark
                        ? 'text-white group-hover:text-orange-400'
                        : 'text-neutral-900 group-hover:text-orange-600'
                    }`}
                  >
                    {partner.name}
                  </h3>
                  <p className="text-neutral-400 font-medium text-base sm:text-lg mb-4">
                    {partner.tagline}
                  </p>
                  <p
                    className={`text-sm sm:text-base leading-relaxed mb-8 max-w-lg ${
                      isDark ? 'text-neutral-300' : 'text-neutral-600'
                    }`}
                  >
                    {partner.description}
                  </p>
                  <Link
                    to={partner.link}
                    className="inline-flex items-center gap-2.5 bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-orange-500/25 transition-all duration-300 text-sm hover:scale-105 active:scale-95 group/btn"
                  >
                    {partner.buttonText}{' '}
                    <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-wider text-orange-600 uppercase mb-1">
              FULL DIRECTORY
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              All Brands We Carry
            </h2>
          </div>
          <Link
            to="/products"
            className="text-neutral-500 hover:text-orange-600 text-sm font-bold flex items-center gap-1 transition-colors group/link"
          >
            Shop All <ChevronRight className="h-4 w-4 transform group-hover/link:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {allDirectoryBrands.map((brand, idx) => (
            <Link
              key={idx}
              to={`/products?brand=${brand.slug}`}
              className="group bg-[#FAFAFA] p-5 sm:p-6 rounded-2xl border border-neutral-200/60 shadow-xs hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900 group-hover:text-orange-600 transition-colors">
                  {brand.name}
                </h3>
                <p className="text-xs font-medium text-neutral-400 mt-0.5">
                  {brand.category}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-neutral-400/90 group-hover:text-orange-500 transition-colors block">
                  {brand.count}
                </span>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block -mt-0.5">
                  ITEMS
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[2.5rem] bg-[#18181B] p-8 sm:p-10 lg:p-12 text-white relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl border border-neutral-800 group hover:border-orange-500/50 transition-all duration-500">
        <div className="max-w-xl relative z-10">
          <span className="text-xs font-bold tracking-wider text-orange-500 uppercase mb-2 block">
            BRAND PARTNERSHIPS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Looking for a specific brand?
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-medium">
            We can source products from any brand on request.
          </p>
        </div>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2.5 bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300 text-sm hover:scale-105 active:scale-95 shrink-0 group/btn relative z-10"
        >
          Contact Us{' '}
          <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1.5 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}



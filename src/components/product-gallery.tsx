'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Dictionary } from '@/i18n/get-dictionary';

export function ProductGallery({
  images,
  alt,
  dict,
}: {
  images: string[];
  alt: string;
  dict: Dictionary;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-sm border border-papyrus-300/60 bg-papyrus-50">
        <Image
          key={images[active]}
          src={images[active]}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className="object-contain p-6"
        />
      </div>

      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label={dict.product.gallery}>
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${dict.product.viewImage} ${index + 1}`}
                aria-current={index === active}
                className={`relative block aspect-square w-full overflow-hidden rounded-sm border bg-papyrus-50 transition-colors ${
                  index === active
                    ? 'border-gold-500'
                    : 'border-papyrus-300/60 hover:border-gold-400'
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="20vw"
                  className="object-contain p-1.5"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

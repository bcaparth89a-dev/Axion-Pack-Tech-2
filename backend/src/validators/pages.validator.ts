import { z } from 'zod';

export const updateHomePageSchema = z.object({
  body: z.object({
    hero: z
      .object({
        badge: z.string().optional(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        primaryButtonText: z.string().optional(),
        primaryButtonLink: z.string().optional(),
        secondaryButtonText: z.string().optional(),
        secondaryButtonLink: z.string().optional(),
        videoLandscapeUrl: z.string().optional(),
        videoPortraitUrl: z.string().optional(),
      })
      .optional(),
    intro: z
      .object({
        tagline: z.string().optional(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        points: z.array(z.string()).optional(),
      })
      .optional(),
    previews: z
      .object({
        productsTitle: z.string().optional(),
        productsSubtitle: z.string().optional(),
        industriesTitle: z.string().optional(),
        industriesSubtitle: z.string().optional(),
        servicesTitle: z.string().optional(),
        servicesSubtitle: z.string().optional(),
        careersTitle: z.string().optional(),
        careersSubtitle: z.string().optional(),
        blogTitle: z.string().optional(),
        blogSubtitle: z.string().optional(),
        newsTitle: z.string().optional(),
        newsSubtitle: z.string().optional(),
      })
      .optional(),
    seo: z
      .object({
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        canonicalUrl: z.string().optional(),
        ogImage: z.string().optional(),
      })
      .optional(),
  }),
});

export const updateAboutPageSchema = z.object({
  body: z.object({
    hero: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string().optional(),
        highlightedTitle: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        ctaText: z.string().optional(),
        ctaUrl: z.string().optional(),
        showCta: z.boolean().optional(),
      })
      .optional(),
    mediaSlider: z
      .object({
        enabled: z.boolean().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              mediaId: z.string().optional(),
              type: z.enum(['image', 'video']).default('image'),
              provider: z.enum(['r2', 'external']).optional(),
              sourceType: z.enum(['upload', 'url']).optional(),
              title: z.string(),
              caption: z.string().optional(),
              url: z.string(),
              posterUrl: z.string().optional(),
              alt: z.string().optional(),
              enabled: z.boolean().default(true),
              order: z.number().default(0),
              autoplay: z.boolean().optional(),
              originalFileName: z.string().optional(),
              originalSize: z.number().optional(),
              optimizedSize: z.number().optional(),
              width: z.number().optional(),
              height: z.number().optional(),
              duration: z.number().optional(),
              format: z.string().optional(),
            })
          )
          .optional(),
      })
      .optional(),
    aboutInfo: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        tagline: z.string().optional(),
        location: z.string().optional(),
        paragraphs: z.array(z.string()).optional(),
        stats: z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
              highlight: z.string().optional(),
              icon: z.string().optional(),
              order: z.number().optional(),
              enabled: z.boolean().optional(),
            })
          )
          .optional(),
        capabilities: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              icon: z.string().optional(),
            })
          )
          .optional(),
      })
      .optional(),
    companyDescription: z.string().optional(),
    history: z.string().optional(),
    vision: z.string().optional(),
    mission: z.string().optional(),
    visionMission: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        visionTitle: z.string().optional(),
        visionText: z.string().optional(),
        visionBadge: z.string().optional(),
        missionTitle: z.string().optional(),
        missionText: z.string().optional(),
        missionBadge: z.string().optional(),
        coreValues: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              icon: z.string().optional(),
              enabled: z.boolean().optional(),
              order: z.number().optional(),
            })
          )
          .optional(),
      })
      .optional(),
    coreValues: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: z.string().optional(),
          enabled: z.boolean().optional(),
          order: z.number().optional(),
        })
      )
      .optional(),
    whyChooseUs: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: z.string().optional(),
          enabled: z.boolean().optional(),
          order: z.number().optional(),
        })
      )
      .optional(),
    whyChooseUsSection: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              icon: z.string().optional(),
              enabled: z.boolean().optional(),
              order: z.number().optional(),
            })
          )
          .optional(),
      })
      .optional(),
    responsibilitiesSection: z
      .object({
        badge: z.string().optional(),
        heading: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        badgeTitle: z.string().optional(),
        badgeSubtitle: z.string().optional(),
        points: z.array(z.string()).optional(),
        ctaText: z.string().optional(),
        ctaUrl: z.string().optional(),
      })
      .optional(),
    sections: z
      .object({
        hero: z.boolean().optional(),
        mediaSlider: z.boolean().optional(),
        aboutInfo: z.boolean().optional(),
        whyChooseUs: z.boolean().optional(),
        visionMission: z.boolean().optional(),
        responsibilities: z.boolean().optional(),
      })
      .optional(),
    seo: z
      .object({
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        canonicalUrl: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        ogImage: z.string().optional(),
      })
      .optional(),
  }),
});

export const updateResponsibilityPageSchema = z.object({
  body: z.object({
    hero: z
      .object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        image: z.string().optional(),
      })
      .optional(),
    ecological: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        points: z.array(z.string()).optional(),
      })
      .optional(),
    market: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        points: z.array(z.string()).optional(),
      })
      .optional(),
    social: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        points: z.array(z.string()).optional(),
      })
      .optional(),
    quality: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        points: z.array(z.string()).optional(),
      })
      .optional(),
    leadershipQuote: z
      .object({
        quote: z.string().optional(),
        author: z.string().optional(),
        designation: z.string().optional(),
      })
      .optional(),
    videos: z.array(z.string()).optional(),
  }),
});

export const updateCategoryHeroSchema = z.object({
  body: z.object({
    enabled: z.boolean().optional(),
    status: z.enum(['draft', 'published']).optional(),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    primaryButton: z
      .object({
        text: z.string().optional(),
        link: z.string().optional(),
      })
      .optional(),
    secondaryButton: z
      .object({
        enabled: z.boolean().optional(),
        text: z.string().optional(),
        link: z.string().optional(),
      })
      .optional(),
    background: z
      .object({
        type: z.enum(['image', 'gradient', 'solid']).optional(),
        image: z.string().optional(),
        color: z.string().optional(),
        gradient: z.string().optional(),
        overlayOpacity: z.number().min(0).max(100).optional(),
      })
      .optional(),
    visual: z
      .object({
        type: z.enum(['image', 'video']).optional(),
        image: z.string().optional(),
        video: z.string().optional(),
        videoPoster: z.string().optional(),
        altText: z.string().optional(),
      })
      .optional(),
    alignment: z.enum(['left', 'center']).optional(),
    animation: z.enum(['none', 'fade', 'slide', 'scale']).optional(),
  }),
});

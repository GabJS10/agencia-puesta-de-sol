import type { Schema, Struct } from '@strapi/strapi';

export interface EstadisticaEstadistica extends Struct.ComponentSchema {
  collectionName: 'components_estadistica_estadisticas';
  info: {
    displayName: 'Estadistica';
    icon: 'question';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    value: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 4;
      }>;
  };
}

export interface HomeHeroFooter extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_footers';
  info: {
    displayName: 'Footer';
    icon: 'layout';
  };
  attributes: {
    AboutFooter: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
    author: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    email: Schema.Attribute.Email & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    location: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    number: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 10;
      }>;
    phrase: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface HomeHeroHomeHero extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_home_heroes';
  info: {
    displayName: 'HomeHero';
    icon: 'landscape';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 25;
      }>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeHeroHomeTours extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_home_tours';
  info: {
    displayName: 'HomeTours';
    icon: 'bulletList';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    location: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    price: Schema.Attribute.Float & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 25;
      }>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeHeroReviews extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_reviews';
  info: {
    displayName: 'reviews';
    icon: 'emotionHappy';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 125;
      }>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 25;
      }>;
    photo: Schema.Attribute.Media<'images'>;
    rating: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
  };
}

export interface PlanesTags extends Struct.ComponentSchema {
  collectionName: 'components_planes_tags';
  info: {
    displayName: 'Tags';
    icon: 'bulletList';
  };
  attributes: {
    element: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'estadistica.estadistica': EstadisticaEstadistica;
      'home-hero.footer': HomeHeroFooter;
      'home-hero.home-hero': HomeHeroHomeHero;
      'home-hero.home-tours': HomeHeroHomeTours;
      'home-hero.reviews': HomeHeroReviews;
      'planes.tags': PlanesTags;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}

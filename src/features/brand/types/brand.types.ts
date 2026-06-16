export interface Template {
  id: number;
  title: string;
  applicableFor: string;
  content: string;
}

export interface Investigation {
  id: number;
  name: string;
  category: string;
  subCategory: string;
  templates: Template[];
  configured: boolean;
  /** selected parameter names */
  configParams: string[];
}

export type BrandView = 'list' | 'template' | 'config';

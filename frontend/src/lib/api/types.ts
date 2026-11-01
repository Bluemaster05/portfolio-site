import type { components } from './schema';

type Schemas = components['schemas'];

export type SiteSettings = Schemas['SiteSettingsResponseDto'];
export type SectionToggles = Schemas['SectionTogglesDto'];
export type SiteLink = Schemas['LinkDto'];
export type Project = Schemas['ProjectResponseDto'];
export type ProjectSummary = Schemas['ProjectSummaryDto'];
export type Experience = Schemas['ExperienceResponseDto'];
export type Education = Schemas['EducationResponseDto'];
export type Honor = Schemas['HonorResponseDto'];
export type BlogPost = Schemas['BlogPostResponseDto'];
export type BlogPostSummary = Schemas['BlogPostSummaryDto'];
export type ApiToken = Schemas['ApiTokenResponseDto'];
export type ProjectImage = Schemas['ImageDto'];
export type ProjectMediaLayout = Schemas['ProjectMediaLayout'];
export type ApiScope = Schemas['ApiScope'];

export type SectionKey = keyof SectionToggles;

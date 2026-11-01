import { Project } from './entities/project.entity.js';
import { ProjectResponseDto, ProjectSummaryDto } from './dto/project.dto.js';
import { Technology } from '../technologies/entities/technology.entity.js';
import { TechnologySummaryDto } from '../technologies/dto/technology.dto.js';

export function toTechnologySummary(technology: Technology): TechnologySummaryDto {
  const { id, name, slug, iconUrl } = technology;
  return { id, name, slug, iconUrl };
}

/** A project as the API returns it; technologies must be populated. */
export function toProjectResponse(project: Project): ProjectResponseDto {
  return {
    id: project.id,
    published: project.published,
    sortOrder: project.sortOrder,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    content: project.content,
    technologies: project.technologies.getItems().map(toTechnologySummary),
    repoUrl: project.repoUrl,
    liveUrl: project.liveUrl,
    mediaLayout: project.mediaLayout,
    media: project.media,
    startDate: project.startDate,
    endDate: project.endDate,
    featured: project.featured,
  };
}

/** Without the write-up, for lists. */
export function toProjectSummary(project: Project): ProjectSummaryDto {
  const { content: _content, ...summary } = toProjectResponse(project);
  return summary;
}

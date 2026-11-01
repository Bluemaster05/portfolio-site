import { toTechnologySummary } from '../projects/project.mapper.js';
import { Employer } from './entities/employer.entity.js';
import { Experience } from './entities/experience.entity.js';
import { EmployerSummaryDto } from './dto/employer.dto.js';
import { ExperienceResponseDto, ExperienceSummaryDto } from './dto/experience.dto.js';

export function toEmployerSummary(employer: Employer): EmployerSummaryDto {
  const { id, name, url, logoUrl } = employer;
  return { id, name, url, logoUrl };
}

/** A job as the API returns it; employer and technologies must be populated. */
export function toExperienceResponse(job: Experience): ExperienceResponseDto {
  return {
    id: job.id,
    published: job.published,
    sortOrder: job.sortOrder,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    employer: toEmployerSummary(job.employer),
    role: job.role,
    slug: job.slug,
    employmentType: job.employmentType,
    location: job.location,
    startDate: job.startDate,
    endDate: job.endDate,
    description: job.description,
    writeup: job.writeup,
    skills: job.skills,
    technologies: job.technologies.getItems().map(toTechnologySummary),
  };
}

/** Without the write-up, for lists. */
export function toExperienceSummary(job: Experience): ExperienceSummaryDto {
  const { writeup: _writeup, ...summary } = toExperienceResponse(job);
  return summary;
}

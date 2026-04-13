import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  ApplicationStatus,
  Application,
  ApplicationFilters,
  ApplicationStats,
} from '../../common/interfaces';
import { CreateApplicationDto } from '../../common/dto';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  private readonly applications = new Map<string, Application>();

  async createApplication(
    userId: string,
    dto: CreateApplicationDto,
  ): Promise<Application> {
    const id = `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();

    const application: Application = {
      id,
      userId,
      jobId: dto.jobId,
      jobTitle: dto.jobTitle,
      company: dto.company,
      status: ApplicationStatus.APPLIED,
      notes: dto.notes ?? null,
      appliedAt: now,
      updatedAt: now,
    };

    this.applications.set(id, application);
    this.logger.log(
      `Created application ${id} for user ${userId} — ${dto.jobTitle} at ${dto.company}`,
    );

    return application;
  }

  async updateStatus(
    id: string,
    status: ApplicationStatus,
    notes?: string,
  ): Promise<Application> {
    const application = this.applications.get(id);
    if (!application) {
      throw new NotFoundException(`Application "${id}" not found`);
    }

    application.status = status;
    application.updatedAt = new Date();
    if (notes !== undefined) {
      application.notes = notes;
    }

    this.logger.log(`Updated application ${id} status to ${status}`);
    return application;
  }

  async getApplications(
    userId: string,
    filters?: ApplicationFilters,
  ): Promise<Application[]> {
    let results = Array.from(this.applications.values()).filter(
      (app) => app.userId === userId,
    );

    if (filters) {
      results = this.applyFilters(results, filters);
    }

    return results.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }

  async getApplicationStats(userId: string): Promise<ApplicationStats> {
    const apps = Array.from(this.applications.values()).filter(
      (app) => app.userId === userId,
    );

    const byStatus = Object.values(ApplicationStatus).reduce(
      (acc, status) => {
        acc[status] = apps.filter((a) => a.status === status).length;
        return acc;
      },
      {} as Record<ApplicationStatus, number>,
    );

    const responsiveStatuses = new Set<ApplicationStatus>([
      ApplicationStatus.SCREENING,
      ApplicationStatus.INTERVIEWING,
      ApplicationStatus.OFFER,
      ApplicationStatus.REJECTED,
    ]);

    const withResponse = apps.filter((a) => responsiveStatuses.has(a.status));
    const responseRate =
      apps.length > 0 ? (withResponse.length / apps.length) * 100 : 0;

    let avgTimeToResponse: number | null = null;
    if (withResponse.length > 0) {
      const totalMs = withResponse.reduce(
        (sum, app) => sum + (app.updatedAt.getTime() - app.appliedAt.getTime()),
        0,
      );
      const avgMs = totalMs / withResponse.length;
      avgTimeToResponse = Math.round(avgMs / (1000 * 60 * 60 * 24)); // days
    }

    const companyCount = new Map<string, number>();
    for (const app of apps) {
      companyCount.set(app.company, (companyCount.get(app.company) ?? 0) + 1);
    }
    const topCompanies = [...companyCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([company]) => company);

    return {
      total: apps.length,
      byStatus,
      responseRate: Math.round(responseRate * 100) / 100,
      avgTimeToResponse,
      topCompanies,
    };
  }

  private applyFilters(
    apps: Application[],
    filters: ApplicationFilters,
  ): Application[] {
    return apps.filter((app) => {
      if (filters.status && app.status !== filters.status) return false;
      if (
        filters.company &&
        !app.company.toLowerCase().includes(filters.company.toLowerCase())
      )
        return false;
      if (filters.dateFrom && app.appliedAt < filters.dateFrom) return false;
      if (filters.dateTo && app.appliedAt > filters.dateTo) return false;
      return true;
    });
  }
}

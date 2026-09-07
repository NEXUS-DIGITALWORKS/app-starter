import type { RegistryRepository } from '../repositories/registryRepository'
import { mapRowsToRegistryData, type RegistryApiData } from '../mappers/registryMapper'

export class RegistryNotFoundError extends Error {}

export class RegistryService {
  constructor(private readonly repo: RegistryRepository) {}

  async getLatestRegistry(): Promise<RegistryApiData> {
    const release = await this.repo.findLatestPublishedRelease()
    if (!release) throw new RegistryNotFoundError('No published registry release found')
    const rows = await this.repo.loadSnapshotRows(release.id)
    return mapRowsToRegistryData(rows)
  }

  async getRegistryByVersion(versionLabel: string): Promise<RegistryApiData> {
    const release = await this.repo.findReleaseByVersion(versionLabel)
    if (!release) throw new RegistryNotFoundError(`release "${versionLabel}" not found`)
    const rows = await this.repo.loadSnapshotRows(release.id)
    return mapRowsToRegistryData(rows)
  }
}

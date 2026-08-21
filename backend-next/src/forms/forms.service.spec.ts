import { FormsService } from './forms.service'

describe('FormsService', () => {
  it('publishes a draft into an immutable version', async () => {
    const templateRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 1,
        slug: 'registration',
        name: 'Registration',
        status: 'draft',
        draft_schema_json: { fields: [{ id: 'email', name: 'email' }] },
        published_version_id: null,
      }),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    }

    const versionRepo = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({ ...value, id: 'version-1' })),
      findOne: jest.fn(),
    }

    const submissionRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    }

    const service = new FormsService(templateRepo as any, versionRepo as any, submissionRepo as any)

    const published = await service.publish(1)

    expect(versionRepo.save).toHaveBeenCalled()
    expect(published.status).toBe('published')
    expect(published.published_version_id).toBe('version-1')
  })
})

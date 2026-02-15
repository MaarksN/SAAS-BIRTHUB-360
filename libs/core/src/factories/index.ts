import { faker } from '@faker-js/faker';

export interface MockLead {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  createdAt: Date;
}

export function createMockLead(overrides?: Partial<MockLead>): MockLead {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    company: faker.company.name(),
    role: faker.person.jobTitle(),
    createdAt: faker.date.past(),
    ...overrides,
  };
}

import { subscriberUserMock } from '@app/user/user.mocks';
import { JobListEntity } from './entities';

export const jobListMocks: JobListEntity[] = [
  { id: 1, label: 'Queue', order: 1, userId: subscriberUserMock.id },
  { id: 2, label: 'Applied', order: 2, userId: subscriberUserMock.id },
  { id: 3, label: 'Interview', order: 3, userId: subscriberUserMock.id },
  { id: 4, label: 'Offer', order: 4, userId: subscriberUserMock.id },
  { id: 5, label: 'Rejected', order: 5, userId: subscriberUserMock.id },
];

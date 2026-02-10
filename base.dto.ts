import { TimestampDto } from './timestamp.dto';

export interface BaseDto extends TimestampDto {
  id: string;
}

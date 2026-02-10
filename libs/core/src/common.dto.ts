export interface PaginationMetaDto {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface TimestampDto {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface BaseDto extends TimestampDto {
  id: string;
}

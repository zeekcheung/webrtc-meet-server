import { IsOptional } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional() // 可选
  // @IsPositive() // 正值
  readonly offset: number;

  @IsOptional() // 可选
  // @IsPositive() // 正值
  readonly limit: number;
}

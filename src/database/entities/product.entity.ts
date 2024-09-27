import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '@db/entities/category.entity';
import { Transform } from 'class-transformer';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType({ description: 'product ' })
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  price: number;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column({ default: 'Unknown Brand' })
  brand: string;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Field(() => [String])
  @Transform(({ value }) => (value === '' ? [] : value.split(',')))
  @Column()
  images: string;

  @Field()
  @Column()
  productAvailable: boolean;

  @Field()
  @Column({ default: 0 })
  stockQuantity: number;

  @Field()
  @CreateDateColumn({
    name: 'createdAt',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({
    name: 'updatedAt',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

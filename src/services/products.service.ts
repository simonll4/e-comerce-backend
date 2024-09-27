import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  MoreThanOrEqual,
  LessThanOrEqual,
  FindManyOptions,
  Like,
  And,
} from 'typeorm';

import { Product } from '@db/entities/product.entity';
import { Category } from '@db/entities/category.entity';
import { CreateProductDto } from '@dtos/product.dto';
import { UpdateProductDto } from '@dtos/product.dto';
import { FilterProductsDto } from '@dtos/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async byCategory(categoryId: number, params: FilterProductsDto) {
    const options: FindManyOptions<Product> = {
      relations: ['category'],
      where: {
        category: { id: categoryId },
      },
    };
    if (params?.limit > 0 && params?.offset >= 0) {
      options.take = params?.limit;
      options.skip = params?.offset;
    }
    return this.productsRepo.find(options);
  }

  async getAll(params: FilterProductsDto) {
    const options: FindManyOptions<Product> = {
      relations: ['category'],
    };

    const { price, price_min, price_max } = params;
    if (price && !price_min && !price_max) {
      options.where = {
        price,
      };
    }

    if (!price && price_min && price_max) {
      options.where = {
        price: And(MoreThanOrEqual(price_min), LessThanOrEqual(price_max)),
      };
    }

    const { title } = params;
    if (title) {
      options.where = {
        ...options.where,
        title: Like(`%${title}%`),
      };
    }

    const { categoryId } = params;
    if (categoryId) {
      options.where = {
        ...options.where,
        category: { id: categoryId },
      };
    }

    const { brand } = params;
    if (brand) {
      options.where = {
        ...options.where,
        brand: brand,
      };
    }

    const { productAvailable } = params;
    if (productAvailable) {
      options.where = {
        ...options.where,
        productAvailable: Boolean(productAvailable),
      };
    }

    if (params.sortBy) {
      options.order = {
        [params.sortBy]: params.sortDirection ? params.sortDirection : 'ASC',
      };
    }

    if (params?.limit > 0 && params?.offset >= 0) {
      options.take = params?.limit;
      options.skip = params?.offset;
    }

    //return this.productsRepo.find(options);
    const [products, total] = await this.productsRepo.findAndCount(options);

    // Si no hay paginación, solo devolver la lista de productos
    if (
      typeof params?.limit !== 'number' ||
      params.limit <= 0 ||
      typeof params?.offset !== 'number' ||
      params.offset < 0
    ) {
      return { products };
    }

    // Calcular el número total de páginas
    const totalPages = params?.limit ? Math.ceil(total / params?.limit) : 1;

    return {
      products,
      pagination: {
        totalItems: total,
        totalPages,
        offset: params?.offset + params?.limit,
        limit: params?.limit,
      },
    };
  }

  findById(id: number) {
    return this.productsRepo.findOneOrFail({
      relations: ['category'],
      where: { id },
    });
  }

  async update(id: Product['id'], changes: UpdateProductDto) {
    const product = await this.findById(id);
    if (changes.images) {
      //changes.images = JSON.stringify(changes.images);
      if (Array.isArray(changes.images)) {
        changes.images = changes.images.join(',');
      }
    }
    this.productsRepo.merge(product, changes);
    return this.productsRepo.save(product);
  }

  async create(dto: CreateProductDto) {
    console.log(dto);
    const { categoryId, images, ...data } = dto;
    const category = await this.categoryRepo.findOneByOrFail({
      id: categoryId,
    });

    const newProduct = this.productsRepo.create({
      ...data,
      images: Array.isArray(images) ? images.join(',') : images,
    });
    newProduct.category = category;
    return this.productsRepo.save(newProduct);
  }

  async delete(id: number) {
    const product = await this.findById(id);
    await this.productsRepo.delete({ id: product.id });
    return true;
  }

  getRaw() {
    return this.productsRepo.query('SELECT * FROM product');
  }
}

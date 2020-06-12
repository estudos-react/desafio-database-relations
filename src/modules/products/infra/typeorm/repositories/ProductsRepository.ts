import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: { name },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsWithIds = await this.ormRepository.findByIds(products);

    return productsWithIds;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsId = products.map(product => product.id);

    const productsWithIds = await this.ormRepository.findByIds(productsId);

    productsWithIds.forEach((product, index) => {
      productsWithIds[index] = {
        ...product,
        quantity:
          product.quantity -
          (products.find(p => p.id === product.id)?.quantity || 0),
      };
    });

    const productsWithUpdatedQuantity = await this.ormRepository.save(
      productsWithIds,
    );

    return productsWithUpdatedQuantity;
  }
}

export default ProductsRepository;

import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Cliente inexistente');
    }

    const productsIds = products.map(product => ({ id: product.id }));

    const productsFindeds = await this.productsRepository.findAllById(
      productsIds,
    );

    if (productsFindeds.length === 0) {
      throw new AppError('Nenhum produto foi encontrado.');
    }

    const productsIdFindeds = productsFindeds.map(item => item.id);

    const containsNonExistentProduct = productsIds.some(
      item => !productsIdFindeds.includes(item.id),
    );

    if (containsNonExistentProduct) {
      throw new AppError('Produto inexiste no meio do pedido.');
    }

    const compareQuantityRequestWithQuantityExistent = (
      productId: string,
    ): number => {
      const product = productsFindeds.find(item => item.id === productId);

      return product ? product.quantity : 0;
    };

    const containsProductWithInsufficientQuantity = products.some(
      product =>
        product.quantity >
        compareQuantityRequestWithQuantityExistent(product.id),
    );

    if (containsProductWithInsufficientQuantity) {
      throw new AppError(
        'Produto(s) com quantidade insufiente no meio do pedido.',
      );
    }

    const productsOrder = productsFindeds.map(product => ({
      product_id: product.id,
      price: product.price,
      quantity: products.find(item => item.id === product.id)?.quantity || 1,
    }));

    const createdOrder = await this.ordersRepository.create({
      customer,
      products: productsOrder,
    });

    const productsDataForUpdateQuantity = productsOrder.map(
      ({ product_id, quantity }) => ({
        id: product_id,
        quantity,
      }),
    );

    await this.productsRepository.updateQuantity(productsDataForUpdateQuantity);

    return createdOrder;
  }
}

export default CreateOrderService;

import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

import Order from '@modules/orders/infra/typeorm/entities/Order';
import Product from '@modules/products/infra/typeorm/entities/Product';

@Entity('order_products')
class OrdersProducts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'id' })
  order: Order;

  @ManyToOne(() => Product, {
    eager: true,
  })
  product: Product;

  @Column()
  product_id: string;

  @Column()
  order_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column('bigint')
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default OrdersProducts;
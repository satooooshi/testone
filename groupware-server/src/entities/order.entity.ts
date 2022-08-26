import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderCard } from './orderCards.entity';

// export enum OrderStatus {
//   ON_SALE = 'on_sale',
//   BEFORE_SALE = 'pre_sales',
//   WITHDRAWAL_OF_SALE = 'withdrawal_of_sale',
// }
@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'address',
    length: 500,
    nullable: false,
    default: '',
  })
  address: string;

  @Column({
    type: 'int',
    name: 'total_amount',
    nullable: false,
    default: 0,
  })
  totalAmount: number;

  @Column({
    type: 'int',
    name: 'postage',
    nullable: false,
    default: 0,
  })
  postage: number;

  @Column({
    type: 'varchar',
    name: 'post_code',
    nullable: false,
    default: '',
  })
  postCode: string;

  // @Column({
  //   type: 'enum',
  //   name: 'status',
  //   enum: OrderStatus,
  //   default: OrderStatus.BEFORE_SALE,
  // })
  // status: OrderStatus;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;

  @OneToMany(() => OrderCard, (orderCard) => orderCard.order, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  orderCard: OrderCard;
}

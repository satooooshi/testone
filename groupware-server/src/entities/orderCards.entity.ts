import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Card } from './card.entity';
import { Order } from './order.entity';

@Entity({ name: 'order_cards' })
export class OrderCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    name: 'count',
    nullable: false,
    default: 0,
  })
  count: number;

  @ManyToOne(() => Order, (order) => order.orderCard, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order?: Order;

  @ManyToOne(() => Card, (card) => card.orderCard, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'card_id' })
  card?: Card;
}

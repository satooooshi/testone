import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { OrderCard } from './orderCards.entity';

export enum CardStatus {
  ON_SALE = 'on_sale',
  BEFORE_SALE = 'pre_sales',
  WITHDRAWAL_OF_SALE = 'withdrawal_of_sale',
}
@Entity({ name: 'card' })
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'name',
    length: 500,
    nullable: false,
    default: '',
  })
  name: string;

  @Column({
    type: 'longtext',
    name: 'description',
    nullable: false,
    default: '',
  })
  description: string;

  @Column({
    type: 'int',
    name: 'price_without_tax',
    nullable: false,
    default: 0,
  })
  priceWithoutTax: number;

  @Column({
    type: 'varchar',
    name: 'image_url',
    length: 2083,
    nullable: false,
    default: '',
  })
  imageURL: string;

  @Column({
    type: 'enum',
    name: 'status',
    enum: CardStatus,
    default: CardStatus.BEFORE_SALE,
  })
  status: CardStatus;

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

  @OneToMany(() => Cart, (cart) => cart.card, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  cart: Cart;

  @OneToMany(() => OrderCard, (orderCard) => orderCard.card, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  orderCard: OrderCard;
}

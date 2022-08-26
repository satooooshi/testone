import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'shipping_address' })
export class ShippingAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    name: 'address',
    length: '500',
    nullable: false,
    default: '',
  })
  address: string;

  @Column({
    type: 'varchar',
    name: 'post_code',
    nullable: false,
    default: '',
  })
  postCode: string;

  @ManyToOne(() => User, (user) => user.shippingAddress, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class createNecessaryEntitiesToBusinessCard1661502186497
  implements MigrationInterface
{
  name = 'createNecessaryEntitiesToBusinessCard1661502186497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE shipping_address (id int NOT NULL AUTO_INCREMENT, address varchar(500) NOT NULL DEFAULT '', post_code varchar(255) NOT NULL DEFAULT '', user_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE carts (id int NOT NULL AUTO_INCREMENT, user_id int NULL, card_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE orders (id int NOT NULL AUTO_INCREMENT, address varchar(500) NOT NULL DEFAULT '', total_amount int NOT NULL DEFAULT '0', postage int NOT NULL DEFAULT '0', post_code varchar(255) NOT NULL DEFAULT '', created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE order_cards (id int NOT NULL AUTO_INCREMENT, count int NOT NULL DEFAULT '0', order_id int NULL, card_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE cards (id int NOT NULL AUTO_INCREMENT, name varchar(500) NOT NULL DEFAULT '', description longtext NOT NULL, price_without_tax int NOT NULL DEFAULT '0', image_url varchar(2083) NOT NULL DEFAULT '', status enum ('on_sale', 'pre_sales', 'withdrawal_of_sale') NOT NULL DEFAULT 'pre_sales', created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE shipping_address ADD CONSTRAINT FK_74b2fbb738d4c71d801a8b974a0 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE carts ADD CONSTRAINT FK_2ec1c94a977b940d85a4f498aea FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE carts ADD CONSTRAINT FK_97cfd59198210d3f0916552195c FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE order_cards ADD CONSTRAINT FK_4d68392d29cdaf7693ca843ef8c FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE order_cards ADD CONSTRAINT FK_707314db8a0d38bd66f6bee68c9 FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE order_cards DROP FOREIGN KEY FK_707314db8a0d38bd66f6bee68c9`,
    );
    await queryRunner.query(
      `ALTER TABLE order_cards DROP FOREIGN KEY FK_4d68392d29cdaf7693ca843ef8c`,
    );
    await queryRunner.query(
      `ALTER TABLE carts DROP FOREIGN KEY FK_97cfd59198210d3f0916552195c`,
    );
    await queryRunner.query(
      `ALTER TABLE carts DROP FOREIGN KEY FK_2ec1c94a977b940d85a4f498aea`,
    );
    await queryRunner.query(
      `ALTER TABLE shipping_address DROP FOREIGN KEY FK_74b2fbb738d4c71d801a8b974a0`,
    );
    await queryRunner.query(`DROP TABLE cards`);
    await queryRunner.query(`DROP TABLE order_cards`);
    await queryRunner.query(`DROP TABLE orders`);
    await queryRunner.query(`DROP TABLE carts`);
    await queryRunner.query(`DROP TABLE shipping_address`);
  }
}

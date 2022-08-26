import { MigrationInterface, QueryRunner } from 'typeorm';

export class createNecessaryEntitiesToBussinessCard1661489434130
  implements MigrationInterface
{
  name = 'createNecessaryEntitiesToBussinessCard1661489434130';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE shipping_address (id int NOT NULL AUTO_INCREMENT, address varchar(500) NOT NULL DEFAULT '', post_code varchar(255) NOT NULL DEFAULT '', user_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE cart (id int NOT NULL AUTO_INCREMENT, user_id int NULL, card_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE order (id int NOT NULL AUTO_INCREMENT, address varchar(500) NOT NULL DEFAULT '', total_amount int NOT NULL DEFAULT '0', postage int NOT NULL DEFAULT '0', post_code varchar(255) NOT NULL DEFAULT '', created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE order_cards (id int NOT NULL AUTO_INCREMENT, count int NOT NULL DEFAULT '0', order_id int NULL, card_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE card (id int NOT NULL AUTO_INCREMENT, name varchar(500) NOT NULL DEFAULT '', description longtext NOT NULL DEFAULT '', price_without_tax int NOT NULL DEFAULT '0', image_url varchar(2083) NOT NULL DEFAULT '', status enum ('on_sale', 'pre_sales', 'withdrawal_of_sale') NOT NULL DEFAULT 'pre_sales', created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE shipping_address ADD CONSTRAINT FK_74b2fbb738d4c71d801a8b974a0 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE cart ADD CONSTRAINT FK_f091e86a234693a49084b4c2c86 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE cart ADD CONSTRAINT FK_7fb67f924089fbdad34969d092c FOREIGN KEY (card_id) REFERENCES card(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE order_cards ADD CONSTRAINT FK_4d68392d29cdaf7693ca843ef8c FOREIGN KEY (order_id) REFERENCES order(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE order_cards ADD CONSTRAINT FK_707314db8a0d38bd66f6bee68c9 FOREIGN KEY (card_id) REFERENCES card(id) ON DELETE CASCADE ON UPDATE CASCADE`,
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
      `ALTER TABLE cart DROP FOREIGN KEY FK_7fb67f924089fbdad34969d092c`,
    );
    await queryRunner.query(
      `ALTER TABLE cart DROP FOREIGN KEY FK_f091e86a234693a49084b4c2c86`,
    );
    await queryRunner.query(
      `ALTER TABLE shipping_address DROP FOREIGN KEY FK_74b2fbb738d4c71d801a8b974a0`,
    );
    await queryRunner.query(`DROP TABLE card`);
    await queryRunner.query(`DROP TABLE order_cards`);
    await queryRunner.query(`DROP TABLE order`);
    await queryRunner.query(`DROP TABLE cart`);
    await queryRunner.query(`DROP TABLE shipping_address`);
  }
}

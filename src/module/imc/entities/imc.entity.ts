import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Imc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  peso: number;

  @Column('float')
  altura: number;

  @Column('float')
  imc: number;

  @Column()
  categoria: string;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;

  @ManyToOne(() => User, (user) => user.imcs, {
    eager: false,
    onDelete: 'CASCADE',
  })
  user: User;
}

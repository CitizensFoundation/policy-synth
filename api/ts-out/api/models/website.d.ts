import { Model } from "sequelize";
declare class Website extends Model {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    embedding: number[];
    createdAt: Date;
    updatedAt: Date;
    static getSimilar(searchTerm: string, skip?: number, limit?: number): Promise<Website[]>;
    static initModel(): void;
}
export default Website;
//# sourceMappingURL=website.d.ts.map
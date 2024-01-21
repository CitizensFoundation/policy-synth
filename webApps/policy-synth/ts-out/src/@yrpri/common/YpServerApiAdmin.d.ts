import { YpServerApiBase } from './YpServerApiBase.js';
export declare class YpServerApiAdmin extends YpServerApiBase {
    addCollectionItem(collectionId: number, collectionItemType: string, body: Record<string, unknown>): Promise<any>;
    updateTranslation(collectionType: string, collectionId: number, body: YpTranslationTextData): Promise<any>;
    getTextForTranslations(collectionType: string, collectionId: number, targetLocale: string): Promise<any>;
    addVideoToCollection(collectionId: number, body: Record<string, unknown>, type: string): Promise<any>;
    getCommunityFolders(domainId: number): Promise<any>;
    getAnalyticsData(communityId: number, type: string, params: string): Promise<any>;
    getSsnListCount(communityId: number, ssnLoginListDataId: number): Promise<any>;
    deleteSsnLoginList(communityId: number, ssnLoginListDataId: number): Promise<any>;
}
//# sourceMappingURL=YpServerApiAdmin.d.ts.map
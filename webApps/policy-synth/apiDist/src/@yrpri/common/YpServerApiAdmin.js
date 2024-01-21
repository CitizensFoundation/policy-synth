import { YpServerApiBase } from './YpServerApiBase.js';
export class YpServerApiAdmin extends YpServerApiBase {
    addCollectionItem(collectionId, collectionItemType, body) {
        return this.fetchWrapper(this.baseUrlPath +
            `/${YpServerApiAdmin.transformCollectionTypeToApi(collectionItemType)}/${collectionId}`, {
            method: 'POST',
            body: JSON.stringify(body),
        }, false);
    }
    updateTranslation(collectionType, collectionId, body) {
        return this.fetchWrapper(this.baseUrlPath +
            `/${YpServerApiAdmin.transformCollectionTypeToApi(collectionType)}/${collectionId}/update_translation`, {
            method: 'PUT',
            body: JSON.stringify(body),
        }, false);
    }
    getTextForTranslations(collectionType, collectionId, targetLocale) {
        return this.fetchWrapper(this.baseUrlPath +
            `/${YpServerApiAdmin.transformCollectionTypeToApi(collectionType)}/${collectionId}/get_translation_texts?targetLocale=${targetLocale}`);
    }
    addVideoToCollection(collectionId, body, type) {
        return this.fetchWrapper(this.baseUrlPath + `/videos/${collectionId}/${type}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        }, false);
    }
    getCommunityFolders(domainId) {
        return this.fetchWrapper(this.baseUrlPath + `/domains/${domainId}/availableCommunityFolders`);
    }
    getAnalyticsData(communityId, type, params) {
        return this.fetchWrapper(this.baseUrlPath + `/communities/${communityId}/${type}/getPlausibleSeries?${params}`);
    }
    getSsnListCount(communityId, ssnLoginListDataId) {
        return this.fetchWrapper(this.baseUrlPath +
            `/communities/${communityId}/${ssnLoginListDataId}/ssn_login_list_count`);
    }
    deleteSsnLoginList(communityId, ssnLoginListDataId) {
        return this.fetchWrapper(this.baseUrlPath +
            `/communities/${communityId}/${ssnLoginListDataId}/ssn_login_list_count`, {
            method: 'DELETE',
            body: JSON.stringify({}),
        }, false);
    }
}
//# sourceMappingURL=YpServerApiAdmin.js.map
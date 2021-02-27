import request from '@/utils/request'

export default {
    delete(id) {
        return request.delete(`/admin/product/baseTrademark/remove/${id}`)
    },


    getPageList(page,limit) {
        return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    },

    addOrUpdate(trademark) {
        if (trademark.id) {
            return request.put('/admin/product/baseTrademark/update', trademark)
        } else {
            return request.post('/admin/product/baseTrademark/save', trademark)
        }
    }



}
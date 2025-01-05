import { Application } from '@feathersjs/feathers';
import { DataProvider, GetOneResponse } from '@refinedev/core';

const opMap = {
    ne: '$ne',
    contains: import.meta.env.VITE_LIKE_CLAUSE,
    gte: '$gte',
    lte: '$lte',
    gt: '$gt',
    lt: '$lt',
    in: '$in'
}

export const getDataProvider = (apiUrl: string, feathers: Application): DataProvider => ({
    getList: async({ resource, pagination, sorters, filters }) => {
        const query: {[s: string]: any} = {};
        for (let i=0; i<filters?.length!;i++) {
            const filter = filters![i];
            // @ts-ignore
            if (filter.operator !== 'eq' && filter.operator !== 'and') query[filter.field] = { [opMap[filter.operator]]: filter.value };
            if (filter.operator === 'contains') query[filter.field] = { [opMap[filter.operator]]: `%${filter.value}%` };
            if (filter.operator === 'eq') query[filter.field] = filter.value;
            if (filter.operator === 'and') {
                // @ts-ignore
                query.$and = filter.value.map((v: any) => ({ [filter.field]: v }));
            }
            // console.log(query);
        }
        const sorts: { [k: string]: number } = {};
        for (let i=0; i<sorters?.length!;i++) {
            const sort = sorters![i];
            sorts[sort.field] = sort.order == 'asc' ? 1 : -1;
        }

        const response = await feathers.service(resource).find({
            query: {
                ...query,
                $sort: sorts,
                $limit: pagination?.pageSize,
                $skip: (pagination?.current! * pagination?.pageSize!) - pagination?.pageSize!
            }
        });
        return {
            data: response.data,
            total: response.total
        }
    },
    getOne: async ({ resource, id }) => {
        const response = await feathers.service(resource).get(id);
        return { data: response }
    },
    create: async({ resource, variables }) => {
        const response = await feathers.service(resource).create(variables!);
        return { data: response }
    },
    createMany: async ({ resource, variables }) => {
        const result = [];
        for (let i = 0; i < variables.length; i++) {
            result.push(await feathers.service(resource).create(variables[i]!))
        }
        return { data: result }
    },
    update: async({ resource, id, variables }) => {
        const response = await feathers.service(resource).patch(id, variables!);
        return { data: response }
    },
    deleteMany: async ({ resource, ids }) => {
        let response: any;
        for (let i=0; i < ids.length; i++) {
            const id = ids[i];
            response = await feathers.service(resource).remove(id);
        }
        return { data: response };
    },
    deleteOne: async({ resource, id}) => {
        const response = await feathers.service(resource).remove(id);
        return { data: response }
    },
    getApiUrl: () => apiUrl,
})
import db from 'db'
import fs from 'fs'

import getProject from "../queries/getProject";

type ImportProjectInput = {
    projects: Array<string>
}

export default async function importProjects({projects}: ImportProjectInput) {
    let _projects = [];
    for await(const project of projects) {
        const path = project
        const isInDB = await getProject({where: {path}});

        if (!fs.existsSync(path)) {
            return
        }

        if(!!isInDB) {
            continue
        }

        try {
            const pkg = await fs.promises.readFile(`${path}/package.json`, 'utf-8')
            const pkg_data = JSON.parse(pkg)

            console.log(pkg_data);

            const data = {
                name: pkg_data.name,
                description: pkg_data.description || 'no description',
                path,
                lastActive: (new Date()).getTime()
            }

            const project = await db.project.create({data})

            _projects.push(project);
        } catch (e) {
            console.log('Error: ', e);
            return
        }
    }
        return _projects;
}


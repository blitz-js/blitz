import {Generate} from '../../src/commands/generate'
import * as path from 'path'

describe('`generate` command', () => {
  describe('#getModelNameAndContext', () => {
    it('properly extracts context from arguments', () => {
      const getModelNameAndContext = Generate.prototype.getModelNameAndContext
      expect(getModelNameAndContext('admin/tasks')).toEqual({
        model: 'tasks',
        context: 'admin',
      })

      expect(getModelNameAndContext('admin/projects/tasks')).toEqual({
        model: 'tasks',
        context: path.join('admin', 'projects'),
      })

      // this should fail on windows if generic filesystem-specific code makes it in
      expect(getModelNameAndContext('admin\\projects\\tasks')).toEqual({
        model: 'tasks',
        context: path.join('admin', 'projects'),
      })
    })

    describe('when passing context', () => {
      it('returns both model and context in their own field', () => {
        const getModelNameAndContext = Generate.prototype.getModelNameAndContext
        expect(getModelNameAndContext('tasks', 'admin')).toEqual({
          model: 'tasks',
          context: 'admin',
        })
      })

      it('returns context undefined if not set', () => {
        const getModelNameAndContext = Generate.prototype.getModelNameAndContext
        expect(getModelNameAndContext('tasks')).toEqual({
          model: 'tasks',
          context: undefined,
        })
      })

      it('returns context undefined if empty string', () => {
        const getModelNameAndContext = Generate.prototype.getModelNameAndContext
        expect(getModelNameAndContext('tasks', '')).toEqual({
          model: 'tasks',
          context: undefined,
        })
      })
    })
  })
})

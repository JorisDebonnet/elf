import { createTodo, createUITodo, Todo } from '@eleanor/store/mocks/stores.mock';
import { addEntities, selectAll, updateEntities, withEntities, withUIEntities } from '@eleanor/store/entities';
import { createState } from '@eleanor/store/core/state';
import { Store } from '@eleanor/store/core/store';
import { entitiesUIRef } from '@eleanor/store/entities/entity.state';
import { withProps } from '@eleanor/store/props/props.state';

type UIEntity = { id: number; open: boolean };

describe('store', () => {

  describe('combine', () => {
    const { state, config } = createState(
      withEntities<Todo, Todo['id']>(),
      withUIEntities<UIEntity, Todo['id']>(),
      withProps<{ filter: string }>({ filter: ''})
    );

    const store = new Store({ state, name: 'todos', config });

    it('should fire only once', () => {
      const spy = jest.fn();

      store
        .combine([
          store.pipe(selectAll()),
          store.pipe(selectAll({ ref: entitiesUIRef }))
        ]).subscribe(spy);

      expect(spy).toHaveBeenCalledTimes(1);

      expect(store.getValue()).toMatchSnapshot();

      store.reduce(
        addEntities(createTodo(1)),
        addEntities(createUITodo(1), { ref: entitiesUIRef }),
      )

      expect(spy).toHaveBeenCalledTimes(2);
      expect(store.getValue()).toMatchSnapshot();

      store.reduce(state => ({...state, filter: 'foo' }))

      // Update non related value should not call `next`
      expect(spy).toHaveBeenCalledTimes(2);

      store.reduce(
        updateEntities(1, { title: 'foo' }),
        state => ({...state, filter: 'hello' })
      )

      expect(store.getValue()).toMatchSnapshot();
      expect(spy).toHaveBeenCalledTimes(3);
    });

  });

});

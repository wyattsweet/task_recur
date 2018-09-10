import { compose, graphql } from 'react-apollo'

import AllTasksQuery from '../../queries/AllTasksQuery'
import CreateTaskSub from '../../queries/CreateTaskSubscription'
import DeactivateTask from '../../queries/DeactivateTask'
import UpdateTask from '../../queries/UpdateTask'

const WithData = component => {
  return compose(
    graphql(AllTasksQuery, {
      options: {
        fetchPolicy: 'cache-and-network',
      },
      props: props => ({
        data: props.data,
        subscribeToNewTasks: () => {
          props.data.subscribeToMore({
            document: CreateTaskSub,
            updateQuery: (prev, {subscriptionData: { data: { onCreateTask } }}) => {
              return ({
                ...prev,
                listTasks: {
                  ...prev.listTasks,
                  items: [onCreateTask, ...prev.listTasks.items]
                } 
              })
            },
          })
        }
      }),
    }),

    graphql(DeactivateTask, {
      props: (props) => ({
        onDelete: (task) => props.mutate({
          variables: { id: task.id },
          optimisticResponse: () => ({ updateTask: { ...task }})
        })
      })
    }),

    graphql(UpdateTask, {
      props: props => ({
        onUpdate: (id, title) => props.mutate({
          variables: {id, title},
          optimisticResponse: {
            updateTask: {
              id,
              title,
              __typename: 'Task'
            }
          } 
        })
      })
    })
  )(component)
}

export default WithData

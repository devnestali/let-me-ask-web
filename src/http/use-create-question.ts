import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateQuestionRequest } from './types/create-question-request'
import type { CreateQuestionResponse } from './types/create-question-response'
import type { GetRoomQuestionResponse } from './types/get-room-question-response'

export function useCreateQuestion(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateQuestionRequest) => {
      const response = await fetch(
        `http://localhost:3333/rooms/${roomId}/questions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      const result: CreateQuestionResponse = await response.json()

      return result
    },

    onMutate({ question }) {
      const questions = queryClient.getQueryData<GetRoomQuestionResponse>([
        'get-questions',
        roomId,
      ])

      const questionsArray = questions ?? []

      queryClient.setQueryData<GetRoomQuestionResponse>(
        ['get-questions', roomId],
        [
          {
            id: crypto.randomUUID(),
            question,
            answer: null,
            createdAt: new Date().toISOString(),
          },
          ...questionsArray,
        ]
      )
    },
  })
}

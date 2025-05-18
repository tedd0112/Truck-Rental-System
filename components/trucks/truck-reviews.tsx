import { Star } from "lucide-react"

interface TruckReviewsProps {
  truckId: string
}

export default function TruckReviews({ truckId }: TruckReviewsProps) {
  // Mock reviews data
  const reviews = [
    {
      id: "1",
      userId: "user1",
      userName: "John Doe",
      rating: 5,
      comment:
        "Great truck! It was clean, well-maintained, and perfect for my moving needs. The owner was very helpful and responsive.",
      date: new Date("2023-05-15"),
    },
    {
      id: "2",
      userId: "user2",
      userName: "Jane Smith",
      rating: 4,
      comment: "The truck was in good condition and worked well for my project. Pickup and drop-off were smooth.",
      date: new Date("2023-06-22"),
    },
    {
      id: "3",
      userId: "user3",
      userName: "Robert Johnson",
      rating: 5,
      comment:
        "Excellent experience! The truck was exactly as described and the owner was very accommodating with pickup and return times.",
      date: new Date("2023-07-10"),
    },
  ]

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

      <div className="flex items-center mb-6">
        <div className="flex items-center mr-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
        <span className="text-muted-foreground ml-2">({reviews.length} reviews)</span>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">{review.userName}</h4>
                <p className="text-sm text-muted-foreground">
                  {review.date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

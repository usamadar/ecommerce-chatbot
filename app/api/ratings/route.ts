import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { rating } = await request.json()
    
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating value' },
        { status: 400 }
      )
    }

    // TODO: Store rating in database
    console.log('Received rating:', rating)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}

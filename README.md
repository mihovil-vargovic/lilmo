# Lilmo   
                                                                                
A small web app built to track our newborn's feeding and diaper sessions; originally motivated by a visiting nurse who needed accurate daily totals. My partner and I had been logging everything in a notebook and doing manual calculations once a day. This project replaced that. Both parents can log from their own devices with changes syncing in real time.
                                                                                
Built with Claude Code, Next.js, Supabase, and Vercel. 

 ## Features

  - **Feeding log** — bottle (ml) or boobies (duration), with a time picker that
   defaults to now
  - **Diaper log** — poop, pee, or both                                         
  - **Real-time sync** — both parents see updates instantly via Supabase
  subscriptions
  - **Next feed countdown** — ring turns orange under 10 min, red when overdue
  - **Daily summary** — today's totals with a narrative breakdown per tab       
  - **Full history** — grouped by day, newest first                             
  - **Device limit** — max 4 Apple devices per room; non-Apple devices are      
  blocked                                                                       
  - **Offline banner** — visible indicator when there's no internet connection
  - **PWA** — installable on iPhone/iPad, works from home screen    

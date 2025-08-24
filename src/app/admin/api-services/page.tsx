
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ShieldCheck } from "lucide-react";
import { CodeBlock } from "@/components/code-block";

const requestExample = `
fetch('https://your-oriango-instance.com/api/v1/forms/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'oriango_sk_your_api_key_here'
  },
  body: JSON.stringify({
    partner_id: 2, // Your assigned partner ID
    region_code: 'MLD',
    form_type: 'GEN'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
`;


export default function ApiServicesPage() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Request API Access</CardTitle>
                    <CardDescription>
                        Integrate your systems with Oriango to streamline loan applications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Our API allows approved partners to programmatically generate unique loan form numbers, reducing manual data entry and ensuring compliance. To get started, your organization needs an API key.
                    </p>
                    <p className="font-semibold">
                        To request an API key, please contact the Super Admin at <a href="mailto:superadmin@oriango.com" className="text-primary underline">superadmin@oriango.com</a> with your business details and intended use case.
                    </p>
                    <Button asChild>
                        <a href="mailto:superadmin@oriango.com?subject=API Key Request for Oriango">
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Super Admin
                        </a>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>API Documentation</CardTitle>
                    <CardDescription>
                        Guide for using your generated API key.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Authentication</h3>
                        <p className="text-muted-foreground">
                           All API requests must include your unique API key in the <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">X-API-Key</code> header. The Super Admin will provide this key to you once your request is approved. Keep this key secure, as it authenticates all requests from your system.
                        </p>
                    </div>

                     <div>
                        <h3 className="font-semibold text-lg mb-2">Endpoint: Generate Form Number</h3>
                        <p className="text-muted-foreground mb-2">
                           This endpoint allows you to generate a new, unique form number for a loan application. This is useful for pre-filling application forms in your own system before submitting them to Oriango.
                        </p>
                        <p className="mb-2">
                            <span className="font-semibold">Method:</span> <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">POST</code>
                        </p>
                        <p className="mb-4">
                           <span className="font-semibold">URL:</span> <code className="bg-muted px-1 py-0.5 rounded font-mono text-sm">/api/v1/forms/generate</code>
                        </p>
                        
                        <h4 className="font-medium mb-2">Request Body:</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4">
                            <li><code className="font-mono text-sm">partner_id</code> (integer): Your unique ID, provided by the Super Admin.</li>
                            <li><code className="font-mono text-sm">region_code</code> (string): The region for the form (e.g., "MLD", "KSI").</li>
                            <li><code className="font-mono text-sm">form_type</code> (string): The type of form (e.g., "GEN", "BZ").</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-2">Example Request (Node.js)</h3>
                        <CodeBlock code={requestExample} />
                    </div>

                     <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        <div>
                            <h4 className="font-semibold">Security Note</h4>
                            <p className="text-sm text-muted-foreground">
                                API activity is monitored by the Super Admin. Any misuse or violation of terms will result in immediate revocation of your API key.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
